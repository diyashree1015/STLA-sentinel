from fastapi import APIRouter
from backend.services.weather_service import weather_service

router = APIRouter()

@router.get("/current")
async def get_current_weather(lat: float, lng: float):
    weather_data = weather_service.get_weather_risk(lat, lng)
    return {
        "status": "success",
        "data": weather_data
    }
