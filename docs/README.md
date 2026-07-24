# SentinelAI – AI Mobility Safety Ecosystem

[![Version](https://img.shields.io/badge/SafeOS-v1.4.22-2563eb.svg)](https://github.com/diyashree1015/STLA-sentinel)
[![Stellantis](https://img.shields.io/badge/Track-Connected_Mobility_Safety-22c55e.svg)](https://stellantis.com)
[![License](https://img.shields.io/badge/License-MIT-f59e0b.svg)](LICENSE)

> **Predict • Prevent • Protect**  
> An enterprise-grade, real-time AI ecosystem that predicts, prevents, and manages road mobility risks by combining Computer Vision, Multimodal Sensor Fusion, Connected Vehicle Telematics, Weather Intelligence, Emergency Dispatch, and Municipal Analytics.

---

## 🌟 Key Features

1. **Driver Monitoring System (DMS)**
   - MediaPipe FaceMesh tracking Eye Aspect Ratio (EAR), Mouth Aspect Ratio (MAR), and Head Pose Estimation.
   - Real-time detection of eye closure, blink rates, yawning, phone distraction, and seatbelt compliance.
   - Categorizes driver status into **Low, Medium, High, and Critical Fatigue**.

2. **YOLOv11 Object & Obstacle Detection**
   - Computer vision inference identifying Pedestrians, Cars, Trucks, Animals, Debris, and Emergency Vehicles with bounding boxes and confidence metrics.

3. **Weather Intelligence Engine**
   - OpenWeather API integration scoring environmental risks for Heavy Rain, Fog, Low Visibility, Strong Winds, Night Driving, and Sun Glare.

4. **Dynamic Multimodal Risk Prediction Engine**
   - Sensor fusion engine aggregating Driver Fatigue (30%), Weather (20%), Road Condition (20%), Vehicle Speed (15%), and Obstacle Proximity (15%).
   - Generates Dynamic Risk Score (0-100): Safe (0-30), Moderate (31-60), High (61-90), Critical (91-100).

5. **Explainable AI (XAI) Decision Engine**
   - Evaluates multi-layer risk indicators to output human-explainable natural language safety rationale and prioritized interventions.

6. **Safe Route Recommendation System**
   - Multi-criteria routing comparing Fastest Route vs. Safest Route based on real-time hazard density, weather overlays, and historical blackspots.

7. **Autonomous Emergency SOS Dispatch**
   - Sensor threshold crash detection triggering a 10-second countdown, live GPS dispatch payloads, nearest hospital locator, and automated ambulance tracking.

8. **Government & Municipal Oversight Dashboard**
   - District-by-district safety index metrics, dangerous corridor rankings, accident heatmaps, and hazard report logs.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 18, Vite, React Router v6 |
| **Styling & UI** | Tailwind CSS, Framer Motion, Lucide Icons |
| **Interactive Maps** | Leaflet.js, OpenStreetMap, CartoDB Dark Matter |
| **Backend API Server** | FastAPI (Python 3.10+), Async Uvicorn |
| **Real-time Streaming** | WebSockets (`ws://localhost:8000/ws/telematics`) |
| **Auth & Database** | Firebase Authentication, Firebase Firestore, Firebase Storage |
| **Computer Vision / AI**| MediaPipe, OpenCV, YOLOv11 (PyTorch / ONNX) |
| **Risk Inference / ML** | XGBoost, Scikit-Learn |
| **External APIs** | OpenWeather API, OpenStreetMap, Firebase Cloud Messaging |

---

## 📁 Repository Structure

```
STLA-sentinel/
├── frontend/             # React 18 + Vite + Tailwind CSS + Framer Motion
├── backend/              # FastAPI Application & WebSocket Telematics Stream
├── ai/                   # Computer Vision, YOLOv11 & XGBoost Risk Inference
└── docs/                 # Full System Documentation & Architecture Specs
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.10 or higher
- **Git**

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access frontend UI at `http://localhost:5173` (or `http://localhost:8080`).

### 3. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API Documentation available at `http://localhost:8000/docs`.

---

## 📜 License & Acknowledgments
Built for the **Stellantis Hackathon 2026** — Connected Mobility Safety Track.
Distributed under the MIT License.
