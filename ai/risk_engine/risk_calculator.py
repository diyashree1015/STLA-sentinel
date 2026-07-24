"""
SentinelAI - Dynamic Risk Prediction Engine
Multimodal Risk Fusion Engine combining Driver, Weather, Road, Speed, and Object Proximity Telemetry.
"""

class MultimodalRiskCalculator:
    """
    Fuses telemetry inputs across 5 operational safety layers:
    1. Driver Fatigue & Distraction Score (30%)
    2. Weather Risk Score (20%)
    3. Road Hazard Density & Quality (20%)
    4. Vehicle Speed & Limits (15%)
    5. Obstacle / Object Detection Threat (15%)
    
    Generates Dynamic Risk Score (0-100) categorized into:
    - 0-30: Safe
    - 31-60: Moderate
    - 61-90: High
    - 91-100: Critical
    """

    def __init__(self, weights=None):
        self.weights = weights or {
            "driver": 0.30,
            "weather": 0.20,
            "road": 0.20,
            "speed": 0.15,
            "object": 0.15
        }

    def compute_speed_risk(self, current_speed_mph, speed_limit_mph=50, weather_condition="Rain"):
        """Calculates speed risk based on excess over speed limit and weather severity."""
        if current_speed_mph <= 0:
            return 0
            
        excess = current_speed_mph - speed_limit_mph
        base_risk = 10
        
        if excess > 20:
            base_risk += 60
        elif excess > 10:
            base_risk += 35
        elif excess > 0:
            base_risk += 15
            
        # In rainy or icy conditions, normal speed carries higher risk
        if "rain" in weather_condition.lower() and current_speed_mph > (speed_limit_mph - 5):
            base_risk += 20
            
        return min(100, max(0, base_risk))

    def evaluate_dynamic_risk(self, driver_fatigue_score, weather_risk_score, road_hazard_score, speed_mph, speed_limit_mph, object_threat_score=10, weather_condition="Rain"):
        """
        Fuses all 5 safety telemetry streams into a single composite Dynamic Risk Score (0-100).
        """
        speed_risk = self.compute_speed_risk(speed_mph, speed_limit_mph, weather_condition)
        
        # Multimodal Weighted Fusion Equation
        composite_score = (
            (driver_fatigue_score * self.weights["driver"]) +
            (weather_risk_score * self.weights["weather"]) +
            (road_hazard_score * self.weights["road"]) +
            (speed_risk * self.weights["speed"]) +
            (object_threat_score * self.weights["object"])
        )
        
        composite_score = round(min(100.0, max(0.0, composite_score)), 1)
        
        # Categorize Risk Level according to specifications
        if composite_score > 90:
            level = "Critical"
            badge_color = "#ef4444"
        elif composite_score > 60:
            level = "High"
            badge_color = "#ef4444"
        elif composite_score > 30:
            level = "Moderate"
            badge_color = "#f59e0b"
        else:
            level = "Safe"
            badge_color = "#22c55e"
            
        return {
            "dynamic_risk_score": composite_score,
            "risk_level": level,
            "badge_color": badge_color,
            "layer_breakdown": {
                "driver_fatigue_contribution": round(driver_fatigue_score * self.weights["driver"], 1),
                "weather_contribution": round(weather_risk_score * self.weights["weather"], 1),
                "road_hazard_contribution": round(road_hazard_score * self.weights["road"], 1),
                "speed_risk_contribution": round(speed_risk * self.weights["speed"], 1),
                "object_threat_contribution": round(object_threat_score * self.weights["object"], 1)
            }
        }

# Execution test verification
if __name__ == "__main__":
    calc = MultimodalRiskCalculator()
    res = calc.evaluate_dynamic_risk(
        driver_fatigue_score=55, # Distracted / Tired
        weather_risk_score=60,   # Rain
        road_hazard_score=40,    # Pothole
        speed_mph=52,
        speed_limit_mph=50,
        object_threat_score=25
    )
    print("Risk Calculator Verification Result:", res)
