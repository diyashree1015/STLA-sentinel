# SentinelAI – System Architecture & SOLID Design Specification

This document details the architectural principles, system component boundaries, data flow pipelines, and SOLID engineering guidelines for the **SentinelAI Mobility Safety Platform**.

---

## 🏛️ Architectural Overview & Clean Architecture Principles

SentinelAI strictly adheres to the **Clean Architecture** pattern, separating concerns into decoupled concentric layers:

```
+-------------------------------------------------------------------+
|                     Presentation Layer (React)                    |
|       (UI Components, Framer Motion, Leaflet Maps, Contexts)      |
+---------------------------------+---------------------------------+
                                  | REST / WebSockets
+---------------------------------v---------------------------------+
|                    Application Layer (FastAPI)                    |
|             (Routing, Authentication, Controllers)                |
+---------------------------------+---------------------------------+
                                  | Dependency Injection
+---------------------------------v---------------------------------+
|                    Domain & Service Layer                         |
|      (Multimodal Risk Engine, Decision Engine, SOS Dispatch)       |
+---------------------------------+---------------------------------+
                                  | Inferences / Persistence
+---------------------------------v---------------------------------+
|               AI Core & Data Infrastructure Layer                 |
|    (MediaPipe, YOLOv11, XGBoost, Firebase Firestore, Weather API) |
+-------------------------------------------------------------------+
```

---

## 💎 SOLID Principles Enforcement

1. **Single Responsibility Principle (SRP)**:
   - `FatigueDetector`: Dedicated solely to processing facial landmark frames (EAR, MAR, Head Pose).
   - `YOLOObjectDetector`: Responsible only for running bounding box object inferences.
   - `RiskCalculator`: Responsible strictly for fusing multi-sensor metrics into a numeric risk coefficient.

2. **Open/Closed Principle (OCP)**:
   - Risk scoring rules use extensible risk factor interfaces. New risk inputs (e.g., Tire Pressure, Vehicle Mass) can be added without modifying core fusion logic.

3. **Liskov Substitution Principle (LSP)**:
   - Weather services and map tile providers derive from abstract base interfaces, allowing mock data providers to be swapped seamlessly during unit testing.

4. **Interface Segregation Principle (ISP)**:
   - WebSocket broadcast schemas stream focused telemetry payloads rather than monolithic state blobs.

5. **Dependency Inversion Principle (DIP)**:
   - High-level decision engine depends on abstract telemetry schemas rather than concrete camera or sensor hardware drivers.

---

## 🔄 Real-time Data Telemetry Flow

```
Camera / Sensors ──> MediaPipe/YOLO ──> Telematics Service ──> WebSocket Broadcast ──> React UI
                          │
                          ▼
                 XGBoost Risk Engine ──> Decision Engine (XAI) ──> Voice & HUD Warnings
```

1. **Frame Capture**: Webcam or dashcam streams 30 FPS video into MediaPipe FaceMesh & YOLOv11 wrappers.
2. **Feature Extraction**: EAR, MAR, Head Pose, and Obstacle Bounding Boxes are extracted as telemetry JSON.
3. **Multimodal Fusion**: The Risk Engine computes a composite score (0-100) and passes it to the Decision Engine.
4. **Explainable AI (XAI)**: Generates human-readable safety reasons and orders interventions.
5. **Real-time Broadcast**: FastAPI WebSocket server streams updates to connected React clients at 10Hz.
