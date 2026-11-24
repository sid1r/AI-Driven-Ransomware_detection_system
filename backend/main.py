from fastapi import (
    FastAPI,
    HTTPException,
    Depends
)

from fastapi.middleware.cors import CORSMiddleware

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

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

from auth import (
    authenticate_user,
    create_access_token,
    decode_access_token
)


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="Ransomware Detection API",
    description="AI-powered ransomware detection backend",
    version="1.4.0"
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
# AUTHENTICATION
# ==========================================

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token"
        )

    return payload


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
        "version": "1.4.0"
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
# LOGIN
# ==========================================

@app.post("/auth/login")
def login(data: dict):

    username = data.get("username", "").strip()
    password = data.get("password", "")

    # --------------------------------------
    # Validate input
    # --------------------------------------

    if not username or not password:

        raise HTTPException(
            status_code=400,
            detail="Username and password are required"
        )

    # --------------------------------------
    # Authenticate user
    # --------------------------------------

    user = authenticate_user(
        username,
        password
    )

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    # --------------------------------------
    # Create JWT token
    # --------------------------------------

    token = create_access_token(user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "role": user["role"]
        }
    }


# ==========================================
# CURRENT USER
# ==========================================

@app.get("/auth/me")
def current_user(
    user=Depends(get_current_user)
):

    return {
        "authenticated": True,
        "username": user.get("username"),
        "role": user.get("role")
    }


# ==========================================
# GET LATEST DETECTION
# ==========================================

@app.get(
    "/detection/latest",
    response_model=DetectionResponse
)
def latest_detection(
    user=Depends(get_current_user)
):

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
def detection_history(
    user=Depends(get_current_user)
):

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
def detection_statistics(
    user=Depends(get_current_user)
):

    return get_statistics()


# ==========================================
# UPDATE DETECTION
# ==========================================

@app.post(
    "/detection/update",
    response_model=DetectionResponse
)
def update_detection(data: DetectionRequest):

    # IMPORTANT:
    # This endpoint does NOT require login.
    #
    # The detection engine monitor.py sends
    # ransomware detection results here.
    #
    # Adding JWT authentication here would
    # break the monitoring engine.

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

        "prediction":
            data.prediction,

        "normal_probability":
            data.normal_probability,

        "ransomware_probability":
            data.ransomware_probability,

        "alert":
            alert,

        "file":
            data.file,

        "timestamp":
            datetime.now().isoformat()
    }

    # --------------------------------------
    # Save to SQLite
    # --------------------------------------

    detection_id = save_detection(
        detection
    )

    detection["id"] = detection_id

    # --------------------------------------
    # Return result
    # --------------------------------------

    return detection


# ==========================================
# CLEAR DETECTION HISTORY
# ==========================================

@app.delete("/detection/history")
def clear_detection_history(
    user=Depends(get_current_user)
):

    clear_detections()

    return {
        "status": "cleared",
        "message": "Detection history has been cleared"
    }