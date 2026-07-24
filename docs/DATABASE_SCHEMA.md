# SentinelAI – Firebase Database Schema Specification

SentinelAI utilizes **Firebase Authentication** for identity management and **Firebase Firestore** for real-time document storage.

---

## 🗄️ Firestore Collections

### 1. Collection: `users/{userId}`
Stores driver user profiles and connected vehicle telemetry configurations.
```json
{
  "uid": "stla_user_001",
  "email": "developer@stellantis.com",
  "username": "Eng. John Doe",
  "role": "driver",
  "created_at": "2026-07-24T11:42:00Z",
  "vehicle": {
    "model": "Chrysler Pacifica Hybrid",
    "vin": "1C4RC1HK1JS884321",
    "adas_level": "Level 2+ Active Assist"
  },
  "ice_contact": {
    "name": "Sarah Doe",
    "phone": "+1 (313) 555-0143",
    "relationship": "Spouse"
  },
  "preferences": {
    "dark_hud": true,
    "voice_alerts": true,
    "fatigue_alarm": true,
    "privacy_mode": false
  }
}
```

---

### 2. Collection: `trips/{tripId}`
Stores completed trip telemetry summaries and safe driving certificates.
```json
{
  "trip_id": "TRIP-2026-0724-88",
  "user_id": "stla_user_001",
  "start_time": "2026-07-24T11:14:00Z",
  "end_time": "2026-07-24T11:42:00Z",
  "distance_miles": 14.2,
  "duration_minutes": 28,
  "safety_score": 95,
  "hazards_avoided": 3,
  "hard_braking_events": 1,
  "route_used": "Woodward Safe-Link",
  "certificate_url": "gs://sentinel-ai.appspot.com/reports/TRIP-88.txt"
}
```

---

### 3. Collection: `hazards/{hazardId}`
Crowdsourced and LiDAR-detected road anomalies.
```json
{
  "hazard_id": "HAZ-001",
  "reporter_id": "stla_user_001",
  "type": "pothole",
  "severity": "Warning",
  "location": {
    "lat": 42.3414,
    "lng": -83.0558,
    "address_description": "Woodward Ave deep pothole, left lane"
  },
  "photo_url": "gs://sentinel-ai.appspot.com/hazards/pothole_99.jpg",
  "timestamp": "2026-07-24T11:32:00Z",
  "status": "Active"
}
```

---

### 4. Collection: `incidents/{incidentId}`
Emergency SOS crash alerts and dispatch tracking logs.
```json
{
  "incident_id": "SOS-DET-8842",
  "user_id": "stla_user_001",
  "timestamp": "2026-07-24T11:40:00Z",
  "gps": {
    "lat": 42.3314,
    "lng": -83.0458
  },
  "status": "DISPATCHED",
  "assigned_ambulance": "Ambulance DET-344",
  "eta_minutes": 4,
  "hospital_target": "Henry Ford Emergency Room",
  "airbag_deployed": true
}
```

---

### 5. Collection: `gov_analytics/{districtId}`
Municipal road safety aggregates for government planning dashboards.
```json
{
  "district_id": "WAYNE_COUNTY_DETROIT",
  "road_safety_index": 82.4,
  "rank": "Top 15%",
  "active_hazards": 14,
  "near_misses": 1402,
  "dangerous_corridors": [
    {
      "name": "Jefferson Ave Near Marina",
      "hazard_type": "Waterlogging / Flooding",
      "risk_level": "Critical Risk",
      "status": "Dispatched Crew"
    }
  ]
}
```
