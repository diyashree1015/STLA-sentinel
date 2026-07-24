# SentinelAI – REST API & WebSocket Specification

SentinelAI provides a comprehensive FastAPI REST API alongside a real-time WebSocket telematics stream.

---

## 📡 Base URLs
- **REST Base URL**: `http://localhost:8080/api/v1`
- **WebSocket URL**: `ws://localhost:8080/ws/telematics`

---

## 🔑 Authentication Endpoints (`/api/v1/auth`)

### `POST /auth/login`
Authenticates a user via Firebase Token or email credentials.
- **Request Body**:
  ```json
  {
    "email": "driver@stellantis.com",
    "password": "sentinel2026"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJKV1QiLC...",
    "token_type": "bearer",
    "user": {
      "uid": "stla_user_001",
      "email": "developer@stellantis.com",
      "username": "Eng. John Doe",
      "role": "driver"
    }
  }
  ```

---

## 👁️ Driver Monitoring Endpoints (`/api/v1/driver`)

### `POST /driver/telemetry`
Submits raw frame biometrics for fatigue scoring.
- **Request Body**:
  ```json
  {
    "ear": 0.18,
    "mar": 0.12,
    "head_pose": {"yaw": 4.2, "pitch": -1.5, "roll": 0.8},
    "phone_detected": false,
    "seatbelt_buckled": true
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "fatigue_score": 12,
    "fatigue_level": "Low",
    "attentiveness_score": 95,
    "gaze_position": "Road Center",
    "recommendation": "Driver fully alert."
  }
  ```

---

## ⚡ Risk Prediction & Decision Engine (`/api/v1/risk`)

### `POST /risk/evaluate`
Fuses driver, weather, road, and object detection telemetry.
- **Request Body**:
  ```json
  {
    "driver_score": 58,
    "weather_score": 65,
    "road_score": 40,
    "speed_mph": 55,
    "object_count": 2
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "dynamic_risk_score": 64,
    "risk_level": "High",
    "reasons": [
      "Heavy rainfall reducing road friction",
      "Driver fatigue detected (EAR: 0.15)"
    ],
    "recommendation": "Reduce speed below 45 MPH. Safest alternate route available."
  }
  ```

---

## 🚨 Emergency SOS Endpoints (`/api/v1/emergency`)

### `POST /emergency/dispatch`
Initiates automated emergency responder dispatch.
- **Request Body**:
  ```json
  {
    "gps": {"lat": 42.3314, "lng": -83.0458},
    "vehicle_model": "Chrysler Pacifica Hybrid",
    "airbag_deployed": true
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "sos_id": "SOS-DET-8842",
    "status": "DISPATCHED",
    "assigned_unit": "Ambulance DET-344",
    "eta_minutes": 4,
    "hospital_target": "Henry Ford Emergency Room"
  }
  ```

---

## 🌐 WebSocket Telematics Stream (`ws://localhost:8080/ws/telematics`)

Streams real-time sensor updates at 10Hz to connected CarPlay UI clients.

### Broadcast Event Payload:
```json
{
  "event": "telematics_update",
  "timestamp": 1784873600,
  "data": {
    "speed_mph": 48,
    "safety_score": 94,
    "risk_index": 42,
    "fatigue_score": 15,
    "weather": {"temp_f": 72, "condition": "Wet Roads"},
    "gaze": "Road Center"
  }
}
```
