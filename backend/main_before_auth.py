from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from database import (
    initialize_database,
    save_detection,
    get_all_detections,
    get_latest_detection,
    get_statistics,
    clear_detections
)

from schemas import (
    DetectionRequest,
    DetectionResponse,
    StatisticsResponse
)


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="Ransomware Detection API",
    description="AI-powered ransomware detection backend",
    version="1.3.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# INITIALIZE DATABASE
# ==========================================

initialize_database()


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():

    return {
        "message": "Ransomware Detection API is running",
        "status": "online",
        "version": "1.3.0"
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ==========================================
# GET LATEST DETECTION
# ==========================================

@app.get(
    "/detection/latest",
    response_model=DetectionResponse
)
def latest_detection():

    detection = get_latest_detection()

    if detection is None:

        return {
            "id": None,
            "prediction": "Normal",
            "normal_probability": 1.0,
            "ransomware_probability": 0.0,
            "alert": False,
            "file": None,
            "timestamp": datetime.now().isoformat()
        }

    return detection


# ==========================================
# GET DETECTION HISTORY
# ==========================================

@app.get("/detection/history")
def detection_history():

    detections = get_all_detections()

    return {
        "count": len(detections),
        "detections": detections
    }


# ==========================================
# GET DETECTION STATISTICS
# ==========================================

@app.get(
    "/detection/statistics",
    response_model=StatisticsResponse
)
def detection_statistics():

    return get_statistics()


# ==========================================
# UPDATE DETECTION
# ==========================================

@app.post(
    "/detection/update",
    response_model=DetectionResponse
)
def update_detection(data: DetectionRequest):

    # --------------------------------------
    # Determine alert
    # --------------------------------------

    if data.alert is not None:

        alert = data.alert

    else:

        alert = (
            data.prediction.lower()
            == "ransomware"
        )


    # --------------------------------------
    # Create detection record
    # --------------------------------------

    detection = {

        "prediction": data.prediction,

        "normal_probability":
            data.normal_probability,

        "ransomware_probability":
            data.ransomware_probability,

        "alert": alert,

        "file": data.file,

        "timestamp":
            datetime.now().isoformat()
    }


    # --------------------------------------
    # Save to SQLite
    # --------------------------------------

    detection_id = save_detection(detection)

    detection["id"] = detection_id


    # --------------------------------------
    # Return result
    # --------------------------------------

    return detection

# ==========================================
# CLEAR DETECTION HISTORY
# ==========================================

@app.delete("/detection/history")
def clear_detection_history():

    clear_detections()

    return {
        "status": "cleared",
        "message": "Detection history has been cleared"
    }