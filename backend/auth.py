import os
import sqlite3
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "detections.db")

# Development secret.
# For a real deployment, set SENTINEL_JWT_SECRET as an environment variable.
JWT_SECRET = os.getenv(
    "SENTINEL_JWT_SECRET",
    "sentinel-ai-development-secret-change-this"
)

JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 8


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_auth_database():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin',
            created_at TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()


def hash_password(password: str, salt: str | None = None):
    if salt is None:
        salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        120_000
    ).hex()

    return password_hash, salt


def verify_password(
    password: str,
    stored_hash: str,
    salt: str
):
    calculated_hash, _ = hash_password(
        password,
        salt
    )

    return secrets.compare_digest(
        calculated_hash,
        stored_hash
    )


def create_default_admin():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE username = ?",
        ("admin",)
    )

    existing_user = cursor.fetchone()

    if existing_user is None:
        password_hash, salt = hash_password("admin123")

        cursor.execute(
            """
            INSERT INTO users
            (
                username,
                password_hash,
                salt,
                role,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                "admin",
                password_hash,
                salt,
                "admin",
                datetime.now(timezone.utc).isoformat()
            )
        )

        connection.commit()

    connection.close()


def authenticate_user(
    username: str,
    password: str
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            username,
            password_hash,
            salt,
            role
        FROM users
        WHERE username = ?
        """,
        (username,)
    )

    user = cursor.fetchone()

    connection.close()

    if user is None:
        return None

    if not verify_password(
        password,
        user["password_hash"],
        user["salt"]
    ):
        return None

    return {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"],
    }


def create_access_token(user):
    now = datetime.now(timezone.utc)

    expires = now + timedelta(
        minutes=TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user["id"]),
        "username": user["username"],
        "role": user["role"],
        "iat": now,
        "exp": expires,
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


def decode_access_token(token):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        return payload

    except jwt.PyJWTError:
        return None


# Initialize authentication database
# and create the first administrator account.
initialize_auth_database()
create_default_admin()