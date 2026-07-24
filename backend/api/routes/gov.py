from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
async def get_gov_dashboard():
    # Simulated aggregated analytics for city planners
    return {
        "status": "success",
        "data": {
            "active_hazards": 124,
            "accidents_prevented_today": 18,
            "high_risk_corridors": [
                {"name": "I-75 North", "risk_factor": 88, "cause": "Weather + Speed"},
                {"name": "Woodward Ave", "risk_factor": 65, "cause": "Pedestrian Density"}
            ],
            "fleet_health_avg": 92
        }
    }
