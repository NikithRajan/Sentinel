<<<<<<< HEAD
# Sentinel
SENTINEL — Edge-AI Intrusion Detection and Evacuation Guidance System

SENTINEL is an intelligent, real-time safety solution designed to enhance security and emergency management in smart buildings and restricted environments.

---

## Quick start ✅

Follow these steps from the project root (`c:\Users\prith\OneDrive\Desktop\Sentinel\Sentinel`):

1. Create and activate a virtual environment (Windows):

   PowerShell:
   ```powershell
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   ```

   cmd:
   ```cmd
   python -m venv .venv
   .venv\Scripts\activate.bat
   ```

2. Install dependencies:

   Using pip:
   ```powershell
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

   Or, to use conda (recommended for Windows binary deps):
   ```bash
   conda env create -f environment.yml
   conda activate sentinel
   ```

3. Run the demo test script (use module mode so relative imports work):

```powershell
python -m evacuation.test_graph
```

You can also use the helper scripts:
- PowerShell: `./run_test.ps1`
- Windows cmd: `run_test.bat`

---

## Example intruder input

An example `data/intruder.json` is included. Format:

```json
{
  "intruder_id": "I1",
  "location": {"lat": 10.1560, "lon": 76.3920},
  "radius_meters": 150,
  "timestamp": "2026-01-20T12:00:00Z",
  "threat_level": "high"
}
```

Place your own `data/intruder.json` to test intruder-aware routing.

---

## Notes & Troubleshooting ⚠️

- The repo already includes `data/airport.graphml`. If missing, `osmnx` will download map data (internet required).
- If `osmnx` installation fails on Windows, prefer creating the environment with `conda` (see `environment.yml`).
- Run the script using `python -m evacuation.test_graph` (not `python evacuation/test_graph.py`) to ensure relative imports work.

---

If you'd like, I can add a `requirements-dev.txt`, CI workflow, or a simple README badge—tell me which and I'll add it. ✨
=======
# SENTINEL - Border Security System

SENTINEL is a comprehensive border security system designed to monitor and manage border activities through AI-powered camera systems, real-time data processing, and military command dashboards.

## Project Structure

### `edge-simulator/`
This folder contains Python scripts that simulate the AI camera system deployed at border checkpoints. The simulator mimics the behavior of edge devices that capture video feeds, perform AI-based object detection and recognition, and transmit detection events via MQTT protocol.

**Key Components:**
- Camera simulation and video feed processing
- AI model integration for object detection
- MQTT client for event transmission
- Edge device configuration and management

### `backend-bridge/`
This folder contains a Node.js server that acts as a bridge between the MQTT message broker and Firebase. The server subscribes to MQTT topics from edge devices, processes incoming messages, and stores/updates data in Firebase for real-time access by the military dashboard.

**Key Components:**
- MQTT client subscription and message handling
- Firebase integration (Firestore/Realtime Database)
- Data transformation and validation
- API endpoints for dashboard communication

### `military-dashboard/`
This folder contains a React Vite frontend application designed for military officers to monitor border security activities in real-time. The dashboard provides visualization of alerts, camera feeds, detection history, and system status.

**Key Components:**
- Real-time alert monitoring and notifications
- Camera feed visualization
- Detection history and analytics
- User authentication and role-based access control
- Interactive maps and geolocation features

### `shared/`
This folder contains common JSON schemas and data models used across all components of the SENTINEL system. These schemas ensure data consistency and validation between the edge simulator, backend bridge, and military dashboard.

**Key Components:**
- Detection event schemas
- Alert notification schemas
- Device configuration schemas
- API request/response schemas

## Getting Started

Each module can be developed and deployed independently while maintaining communication through well-defined interfaces and shared schemas.
>>>>>>> development
