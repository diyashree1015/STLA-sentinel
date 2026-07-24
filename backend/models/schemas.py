"""
SentinelAI Pydantic Type Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- AUTH SCHEMAS ---
class LoginRequest(BaseModel):
    email: str = Field(..., example="developer@stellantis.com")
    password: str = Field(..., example="sentinel2026")

class UserProfile(BaseModel):
    uid: str
    email: str
    username: str
    role: str = "driver"
    vehicle_model: str = "Chrysler Pacifica Hybrid"

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

# --- DRIVER MONITORING SCHEMAS ---
class HeadPoseData(BaseModel):
    yaw: float = 0.0
    pitch: float = 0.0
    roll: float = 0.0
    gaze: str = "Road Center"

class DriverTelemetryInput(BaseModel):
    ear: float = Field(..., example=0.22)
    mar: float = Field(..., example=0.18)
    head_pose: HeadPoseData
    phone_detected: bool = False
    seatbelt_buckled: bool = True

class DriverTelemetryOutput(BaseModel):
    attentiveness_score: int
    fatigue_score: int
    fatigue_level: str
    is_eyes_closed: bool
    is_yawning: bool
    recommendation: str

# --- RISK & DECISION SCHEMAS ---
class RiskEvaluationRequest(BaseModel):
    driver_fatigue_score: int = Field(..., ge=0, le=100)
    weather_risk_score: int = Field(..., ge=0, le=100)
    road_hazard_score: int = Field(..., ge=0, le=100)
    speed_mph: float = Field(..., ge=0)
    speed_limit_mph: float = 50.0
    object_threat_score: int = Field(10, ge=0, le=100)
    weather_condition: str = "Rain"

class RiskEvaluationResponse(BaseModel):
    dynamic_risk_score: float
    risk_level: str
    badge_color: str
    action_required: str
    explainable_reasons: List[str]
    priority_interventions: List[str]
    voice_prompt: str

# --- EMERGENCY SOS SCHEMAS ---
class GPSCoordinates(BaseModel):
    lat: float
    lng: float

class EmergencyDispatchRequest(BaseModel):
    gps: GPSCoordinates
    vehicle_model: str = "Chrysler Pacifica Hybrid"
    airbag_deployed: bool = True

class EmergencyDispatchResponse(BaseModel):
    sos_id: str
    status: str
    assigned_unit: str
    eta_minutes: int
    hospital_target: str
    gps: GPSCoordinates

# --- HAZARD SCHEMAS ---
class HazardReportInput(BaseModel):
    type: str
    severity: str
    location_description: str
    gps: Optional[GPSCoordinates] = None

class HazardReportOutput(BaseModel):
    hazard_id: str
    type: str
    severity: str
    location_description: str
    timestamp: str
    status: str = "Active"
