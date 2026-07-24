"""
SentinelAI Weather Service Wrapper
"""
import sys
import os

# Add parent directory to path so we can import from ai module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from ai.weather.weather_intelligence import WeatherIntelligenceEngine
from backend.config import settings

weather_engine = WeatherIntelligenceEngine(api_key=settings.OPENWEATHER_API_KEY)

class WeatherService:
    def get_weather_risk(self, lat: float, lng: float):
        """Fetches live weather and evaluates environmental risk."""
        return weather_engine.fetch_live_weather(lat=lat, lng=lng)

weather_service = WeatherService()
