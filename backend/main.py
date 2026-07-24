import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import auth, driver, weather, risk, emergency, gov
from backend.api.websocket import manager
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from backend.services.biometrics_service import biometrics_service

app = FastAPI(title="SentinelAI Backend Engine", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(driver.router, prefix="/api/driver", tags=["Driver Intelligence"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(risk.router, prefix="/api/risk", tags=["Routing & Risk"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency Services"])
app.include_router(gov.router, prefix="/api/gov", tags=["Government Dashboard"])

@app.get("/")
async def root():
    return {"message": "SentinelAI API is running. Ready to save lives."}

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time driver biometrics and vehicle telemetry.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Simulate real-time continuous monitoring loop
            # In production, this would read from the actual camera/sensors
            analysis = biometrics_service.analyze_frame("live_frame_stream")
            await manager.send_json(analysis, websocket)
            await asyncio.sleep(2) # Send update every 2 seconds
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
