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
