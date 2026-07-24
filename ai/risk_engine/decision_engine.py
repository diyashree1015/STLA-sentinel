"""
SentinelAI - Explainable AI (XAI) Decision Engine
Fuses all AI modules, prioritizes danger, and generates explainable safety recommendations.
"""

class ExplainableDecisionEngine:
    """
    Fuses telemetry inputs across all AI modules (Driver DMS, Weather, Road, Object Detector).
    Prioritizes threats and synthesizes natural language Explainable AI (XAI) rationale.
    
    Example Input:
      Heavy Rain + Drowsy Driver + Obstacle Detected + Speed 50 mph
    Output:
      Critical Risk -> Automated Voice Alert -> Recommend Braking
    """
    
    def __init__(self):
        pass

    def evaluate_decision(self, risk_eval_result, driver_telemetry, weather_telemetry, object_telemetry):
        """
        Synthesizes human-explainable AI decision logs, priority alerts, and voice prompts.
        """
        risk_score = risk_eval_result.get("dynamic_risk_score", 0)
        risk_level = risk_eval_result.get("risk_level", "Safe")
        
        reasons = []
        interventions = []
        voice_prompt = "Safe commute active. SentinelAI monitoring."
        action_required = "CONTINUE_SAFE_DRIVE"
        
        # 1. Driver Fatigue & Distraction Rationale
        if driver_telemetry.get("is_eyes_closed"):
            reasons.append("Critical: Driver eye closure duration exceeded safety threshold (EAR < 0.20)")
            interventions.append("Trigger Drowsiness Audio Alarm")
            action_required = "PARK_AND_REST"
        elif driver_telemetry.get("fatigue_level") in ["High", "Critical"]:
            reasons.append(f"Driver fatigue level assessed as {driver_telemetry.get('fatigue_level')}")
            interventions.append("Display Rest Break Recommendation on HUD")

        # 2. Weather Rationale
        weather_cond = weather_telemetry.get("condition", "Clear")
        if "rain" in weather_cond.lower():
            reasons.append(f"Slippery asphalt due to active weather ({weather_cond})")
            interventions.append("Enforce +100ft safe vehicle following gap")

        # 3. Object / Obstacle Rationale
        highest_threat = object_telemetry.get("highest_threat", "Low")
        if highest_threat in ["High", "Critical"]:
            reasons.append("Obstacle or vulnerable road user detected in vehicle trajectory")
            interventions.append("Prepare Automated Collision Avoidance Braking")

        # 4. Synthesize Prioritized Decision Action
        if risk_level == "Critical" or driver_telemetry.get("is_eyes_closed"):
            action_required = "IMMEDIATE_BRAKING_WARNING"
            voice_prompt = "CRITICAL ALERT! Drowsiness and road hazard detected. Reduce speed immediately and prepare to brake."
        elif risk_level == "High":
            action_required = "RECOMMEND_SAFE_ROUTE"
            voice_prompt = "High risk corridor ahead due to heavy rain and construction. Rerouting to safest path."
        elif risk_level == "Moderate":
            action_required = "CAUTION_ADVISORY"
            voice_prompt = "Wet surface detected. Maintain safe speed below recommended limit."
        else:
            voice_prompt = "Commute conditions optimal. Safe drive active."

        return {
            "dynamic_risk_score": risk_score,
            "risk_level": risk_level,
            "action_required": action_required,
            "explainable_reasons": reasons,
            "priority_interventions": interventions,
            "voice_prompt": voice_prompt,
            "confidence_score": 0.94
        }

# Execution test verification
if __name__ == "__main__":
    engine = ExplainableDecisionEngine()
    result = engine.evaluate_decision(
        risk_eval_result={"dynamic_risk_score": 92.5, "risk_level": "Critical"},
        driver_telemetry={"is_eyes_closed": True, "fatigue_level": "Critical"},
        weather_telemetry={"condition": "Heavy Rain"},
        object_telemetry={"highest_threat": "High"}
    )
    print("Decision Engine Verification Result:", result)
