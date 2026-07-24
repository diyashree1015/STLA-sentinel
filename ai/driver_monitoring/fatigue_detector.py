"""
SentinelAI - Driver Monitoring System (DMS)
MediaPipe FaceMesh & Computer Vision Fatigue Detector
"""

import math
import numpy as np

class DriverFatigueDetector:
    """
    Analyzes facial landmark coordinates to compute Eye Aspect Ratio (EAR),
    Mouth Aspect Ratio (MAR), Head Pose (Yaw/Pitch/Roll), and Fatigue Score.
    """
    
    def __init__(self, ear_threshold=0.20, mar_threshold=0.55,Consecutive_frames=15):
        self.ear_threshold = ear_threshold
        self.mar_threshold = mar_threshold
        self.consecutive_frames = Consecutive_frames
        self.closed_eyes_counter = 0
        self.yawn_counter = 0
        
    @staticmethod
    def euclidean_distance(pt1, pt2):
        """Calculates 2D Euclidean distance between two points."""
        return math.sqrt((pt1[0] - pt2[0])**2 + (pt1[1] - pt2[1])**2)

    def calculate_ear(self, landmarks, eye_indices):
        """
        Calculates Eye Aspect Ratio (EAR) given 6 landmark points around an eye.
        EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)
        """
        p1 = landmarks[eye_indices[0]]
        p2 = landmarks[eye_indices[1]]
        p3 = landmarks[eye_indices[2]]
        p4 = landmarks[eye_indices[3]]
        p5 = landmarks[eye_indices[4]]
        p6 = landmarks[eye_indices[5]]
        
        vertical_1 = self.euclidean_distance(p2, p6)
        vertical_2 = self.euclidean_distance(p3, p5)
        horizontal = self.euclidean_distance(p1, p4)
        
        if horizontal == 0:
            return 0.0
            
        ear = (vertical_1 + vertical_2) / (2.0 * horizontal)
        return ear

    def calculate_mar(self, landmarks, mouth_indices):
        """
        Calculates Mouth Aspect Ratio (MAR) for yawn detection.
        MAR = (||p2 - p8|| + ||p3 - p7|| + ||p4 - p6||) / (2 * ||p1 - p5||)
        """
        p1 = landmarks[mouth_indices[0]] # Left corner
        p2 = landmarks[mouth_indices[1]] # Upper inner lip 1
        p3 = landmarks[mouth_indices[2]] # Upper inner lip 2
        p4 = landmarks[mouth_indices[3]] # Upper inner lip 3
        p5 = landmarks[mouth_indices[4]] # Right corner
        p6 = landmarks[mouth_indices[5]] # Lower inner lip 3
        p7 = landmarks[mouth_indices[6]] # Lower inner lip 2
        p8 = landmarks[mouth_indices[7]] # Lower inner lip 1
        
        v1 = self.euclidean_distance(p2, p8)
        v2 = self.euclidean_distance(p3, p7)
        v3 = self.euclidean_distance(p4, p6)
        h = self.euclidean_distance(p1, p5)
        
        if h == 0:
            return 0.0
            
        mar = (v1 + v2 + v3) / (2.0 * h)
        return mar

    def estimate_head_pose(self, face_landmarks, frame_width=640, frame_height=480):
        """
        Estimates Yaw, Pitch, and Roll angles from 2D facial landmarks.
        """
        if not face_landmarks or len(face_landmarks) < 6:
            return {"yaw": 0.0, "pitch": 0.0, "roll": 0.0, "gaze": "Road Center"}
            
        nose_tip = face_landmarks[1]
        chin = face_landmarks[152]
        left_eye_corner = face_landmarks[33]
        right_eye_corner = face_landmarks[263]
        
        # Approximate yaw angle from nose offset relative to eye center
        eye_center_x = (left_eye_corner[0] + right_eye_corner[0]) / 2.0
        dx = nose_tip[0] - eye_center_x
        yaw = dx * 120.0 # Estimated degrees
        
        # Pitch angle from nose-to-chin vertical ratio
        dy = nose_tip[1] - chin[1]
        pitch = dy * 90.0
        
        gaze = "Road Center"
        if yaw < -15.0:
            gaze = "Gaze Left (Mirror)"
        elif yaw > 15.0:
            gaze = "Gaze Right (Side)"
        elif pitch < -20.0:
            gaze = "Looking Down (Phone Distraction)"
            
        return {"yaw": round(yaw, 1), "pitch": round(pitch, 1), "roll": 0.0, "gaze": gaze}

    def process_telemetry(self, ear_left, ear_right, mar, head_pose):
        """
        Combines EAR, MAR, and Head Pose to compute an overall Fatigue & Distraction Score.
        Returns score (0-100) and risk level: Low, Medium, High, Critical.
        """
        avg_ear = (ear_left + ear_right) / 2.0
        is_eyes_closed = avg_ear < self.ear_threshold
        is_yawning = mar > self.mar_threshold
        
        if is_eyes_closed:
            self.closed_eyes_counter += 1
        else:
            self.closed_eyes_counter = max(0, self.closed_eyes_counter - 1)
            
        if is_yawning:
            self.yawn_counter += 1
            
        # Base score starting at 95 (healthy alert driver)
        fatigue_score = 10 # 0-100 scale where higher = more tired
        
        if self.closed_eyes_counter > 10:
            fatigue_score += 60 # Severe closure
        elif is_eyes_closed:
            fatigue_score += 25
            
        if is_yawning:
            fatigue_score += 20
            
        if head_pose.get("gaze") != "Road Center":
            fatigue_score += 15
            
        fatigue_score = min(100, max(0, fatigue_score))
        
        level = "Low"
        if fatigue_score > 75:
            level = "Critical"
        elif fatigue_score > 50:
            level = "High"
        elif fatigue_score > 25:
            level = "Medium"
            
        attentiveness = max(0, 100 - fatigue_score)
        
        return {
            "attentiveness_score": attentiveness,
            "fatigue_score": fatigue_score,
            "fatigue_level": level,
            "avg_ear": round(avg_ear, 3),
            "mar": round(mar, 3),
            "head_pose": head_pose,
            "is_eyes_closed": is_eyes_closed,
            "is_yawning": is_yawning
        }

# Execution test verification
if __name__ == "__main__":
    detector = DriverFatigueDetector()
    sample_res = detector.process_telemetry(0.24, 0.23, 0.18, {"yaw": 2.0, "pitch": 0.0, "gaze": "Road Center"})
    print("Driver Fatigue Module Verification Result:", sample_res)
