from fastapi import APIRouter
from pydantic import BaseModel
from backend.services.weather_service import weather_service
from backend.services.routing_service import routing_service

router = APIRouter()

class RouteRequest(BaseModel):
    start_lat: float
    start_lng: float
    dest_lat: float
    dest_lng: float

@router.post("/evaluate-route")
async def evaluate_route(req: RouteRequest):
    # Fetch weather context for the destination
    weather_info = weather_service.get_weather_risk(req.dest_lat, req.dest_lng)
    
    risk_score = 0
    if weather_info and "main" in weather_info:
        # Simple heuristic mapping bad weather to higher risk
        condition = weather_info.get("weather", [{}])[0].get("main", "")
        if condition in ["Rain", "Snow", "Thunderstorm", "Drizzle"]:
            risk_score += 40
        elif condition in ["Mist", "Fog"]:
            risk_score += 30
            
    # Get routing recommendations
    routes = routing_service.recommend_routes(
        req.start_lat, req.start_lng, req.dest_lat, req.dest_lng, risk_score
    )
    
    return {
        "status": "success",
        "weather_context": weather_info,
        "routing": routes
    }
