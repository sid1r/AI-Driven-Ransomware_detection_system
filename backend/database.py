import sqlite3
from pathlib import Path


# ==========================================
# DATABASE CONFIGURATION
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "detections.db"


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


# ==========================================
# CREATE DATABASE TABLE
# ==========================================

def initialize_database():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS detections (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            prediction TEXT NOT NULL,

            normal_probability REAL NOT NULL,

            ransomware_probability REAL NOT NULL,

            alert INTEGER NOT NULL,

            file TEXT,

            timestamp TEXT NOT NULL

        )
    """)

    connection.commit()
    connection.close()


# ==========================================
# INSERT DETECTION
# ==========================================

def save_detection(detection):

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO detections (
            prediction,
            normal_probability,
            ransomware_probability,
            alert,
            file,
            timestamp
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        detection["prediction"],
        detection["normal_probability"],
        detection["ransomware_probability"],
        int(detection["alert"]),
        detection["file"],
        detection["timestamp"]
    ))

    detection_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return detection_id

# ==========================================
# GET ALL DETECTIONS
# ==========================================

def get_all_detections():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            prediction,
            normal_probability,
            ransomware_probability,
            alert,
            file,
            timestamp
        FROM detections
        ORDER BY id ASC
    """)

    rows = cursor.fetchall()

    connection.close()

    detections = []

    for row in rows:

        detections.append({
            "id": row["id"],
            "prediction": row["prediction"],
            "normal_probability": row["normal_probability"],
            "ransomware_probability": row["ransomware_probability"],
            "alert": bool(row["alert"]),
            "file": row["file"],
            "timestamp": row["timestamp"]
        })

    return detections


# ==========================================
# GET LATEST DETECTION
# ==========================================

def get_latest_detection():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            prediction,
            normal_probability,
            ransomware_probability,
            alert,
            file,
            timestamp
        FROM detections
        ORDER BY id DESC
        LIMIT 1
    """)

    row = cursor.fetchone()

    connection.close()

    if row is None:
        return None

    return {
        "id": row["id"],
        "prediction": row["prediction"],
        "normal_probability": row["normal_probability"],
        "ransomware_probability": row["ransomware_probability"],
        "alert": bool(row["alert"]),
        "file": row["file"],
        "timestamp": row["timestamp"]
    }


# ==========================================
# GET STATISTICS
# ==========================================

def get_statistics():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT COUNT(*) AS total
        FROM detections
    """)

    total = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT COUNT(*)
        FROM detections
        WHERE LOWER(prediction) = 'normal'
    """)

    normal = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM detections
        WHERE LOWER(prediction) = 'ransomware'
    """)

    ransomware = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM detections
        WHERE alert = 1
    """)

    alerts = cursor.fetchone()[0]

    connection.close()

    return {
        "total_detections": total,
        "normal_detections": normal,
        "ransomware_detections": ransomware,
        "alerts": alerts
    }


# ==========================================
# CLEAR DATABASE
# ==========================================

def clear_detections():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("DELETE FROM detections")

    connection.commit()
    connection.close()