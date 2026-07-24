from fastapi import APIRouter
from backend.services.biometrics_service import biometrics_service

router = APIRouter()

@router.get("/analyze")
async def get_driver_analysis():
    # Return a simulated one-off analysis
    analysis = biometrics_service.analyze_frame("mock_frame_data")
    return {
        "status": "success",
        "analysis": analysis
    }
