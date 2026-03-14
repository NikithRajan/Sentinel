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
