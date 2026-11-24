from pydantic import BaseModel, Field
from typing import Optional


# ==========================================
# DETECTION REQUEST
# ==========================================

class DetectionRequest(BaseModel):

    prediction: str = Field(
        default="Normal",
        description="Model prediction: Normal or Ransomware"
    )

    normal_probability: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Probability of normal activity"
    )

    ransomware_probability: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Probability of ransomware activity"
    )

    alert: Optional[bool] = Field(
        default=None,
        description="Whether a ransomware alert was triggered"
    )

    file: Optional[str] = Field(
        default=None,
        description="File associated with the detection"
    )


# ==========================================
# DETECTION RESPONSE
# ==========================================

class DetectionResponse(BaseModel):

    id: Optional[int] = None

    prediction: str

    normal_probability: float

    ransomware_probability: float

    alert: bool

    file: Optional[str] = None

    timestamp: str


# ==========================================
# STATISTICS RESPONSE
# ==========================================

class StatisticsResponse(BaseModel):

    total_detections: int

    normal_detections: int

    ransomware_detections: int

    alerts: int