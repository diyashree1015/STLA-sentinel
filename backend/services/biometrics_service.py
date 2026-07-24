"""
SentinelAI Biometrics & Driver Monitoring Service
"""
import random

class BiometricsService:
    def analyze_frame(self, frame_data):
        # Simulated analysis of driver state
        # In a real implementation, this would use MediaPipe/OpenCV to analyze facial landmarks
        
        # Simulate normal state most of the time, with occasional fatigue
        state_roll = random.randint(1, 100)
        
        status = "normal"
        attentiveness = random.randint(85, 98)
        
        if state_roll > 95:
            status = "fatigued"
            attentiveness = random.randint(40, 65)
        elif state_roll > 90:
            status = "distracted"
            attentiveness = random.randint(60, 75)
            
        return {
            "driver_state": status,
            "attentiveness_score": attentiveness,
            "heart_rate_bpm": random.randint(68, 76),
            "eye_closure_ratio": random.uniform(0.1, 0.4) if status != "fatigued" else random.uniform(0.6, 0.9),
            "head_pose_deviation": random.uniform(2.0, 5.0) if status != "distracted" else random.uniform(15.0, 25.0)
        }

biometrics_service = BiometricsService()
