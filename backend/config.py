"""
SentinelAI FastAPI Configuration Settings
"""

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SentinelAI Mobility Safety Engine"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "stla_sentinel_secret_key_2026")
    
    # OpenWeather API
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "demo_openweather_key")
    
    # Firebase Service Account
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase_credentials.json")
    
    # CORS Origins
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"]
    
    class Config:
        case_sensitive = True

settings = Settings()
