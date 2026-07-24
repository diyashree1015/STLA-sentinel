from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SOSRequest(BaseModel):
    lat: float
    lng: float
    type: str  # "crash", "health", "manual"

@router.post("/trigger")
async def trigger_sos(req: SOSRequest):
    # In a real system, this would integrate with eCall / First Responders via FCM or direct APIs
    return {
        "status": "success",
        "message": f"Emergency responders dispatched to {req.lat}, {req.lng} for event: {req.type}",
        "eta_minutes": 8
    }
