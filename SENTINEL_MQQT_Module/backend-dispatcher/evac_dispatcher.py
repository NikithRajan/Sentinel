import firebase_admin
from firebase_admin import credentials, firestore
from twilio.rest import Client
import time
import os
import json
import subprocess
import platform
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- 1. TWILIO CONFIGURATION ---
TWILIO_SID = os.getenv('TWILIO_SID')
TWILIO_AUTH = os.getenv('TWILIO_AUTH')
TWILIO_PHONE = os.getenv('TWILIO_PHONE')

# --- 2. EVACUATION CONFIGURATION ---
# Dispatcher resides in Sentinel/SENTINEL_MQQT_Module/backend-dispatcher/
# Target directory is Sentinel/SENTINEL_EVAC/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EVAC_DIR = os.path.normpath(os.path.join(BASE_DIR, "../../SENTINEL_EVAC"))
DATA_DIR = os.path.join(EVAC_DIR, "data")
INTRUDER_JSON = os.path.join(DATA_DIR, "intruder.json")
DIRECTIONS_JSON = os.path.join(DATA_DIR, "evacuation_directions.json")

import sys

EVAC_PYTHON = sys.executable

# --- 3. FIREBASE CONFIGURATION ---
cred = credentials.Certificate('serviceAccountKey.json')
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

print(f"🔒 Loaded Twilio SID: {bool(TWILIO_SID)} | Loaded Auth Token: {bool(TWILIO_AUTH)}")
try:
    twilio_client = Client(TWILIO_SID, TWILIO_AUTH)
except Exception as e:
    twilio_client = None
    print(f"WARNING: Twilio credentials incorrectly loaded or missing. Error: {e}")
    print("SMS will be simulated in console.")

print("📡 DISPATCHER ONLINE: Listening for Evacuation Orders...")

def process_evacuation_order(doc, doc_id):
    # Setup Intruder Data safely from Firebase
    location = doc.get("location")
    threat_lat = 10.1550 # Fallback mock coordinates
    threat_lng = 76.3900 # Fallback mock coordinates 
    
    if isinstance(location, dict):
        threat_lat = float(location.get("lat", threat_lat))
        threat_lng = float(location.get("lng", threat_lng))
    elif isinstance(location, str):
        try:
            parsed = json.loads(location)
            if isinstance(parsed, dict):
                threat_lat = float(parsed.get("lat", threat_lat))
                threat_lng = float(parsed.get("lng", threat_lng))
        except (json.JSONDecodeError, ValueError):
            # Try comma-separated if JSON fails
            if "," in location:
                parts = location.split(",")
                try:
                    threat_lat = float(parts[0].strip())
                    if len(parts) > 1:
                        threat_lng = float(parts[1].strip())
                except ValueError:
                    pass
            else:
                print(f"⚠️ Location string '{location}' is not coordinates. Using mock fallback {threat_lat}, {threat_lng}.")

    
    # Write payload for the local graph routing engine
    payload = {
        "intruder_id": doc_id,
        "intruder_location": {"lat": threat_lat, "lon": threat_lng},
        # Hardcoded mock target location just outside threat radius
        "person_location": {"lat": 10.1538, "lon": 76.3915},
        # Hardcoded safe zones
        "safe_zones": [
            {"lat": 10.1540, "lon": 76.3908},
            {"lat": 10.1546, "lon": 76.3922}
        ],
        "radius_meters": 150,
        "threat_level": doc.get('threat_type', 'high')
    }
    
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(INTRUDER_JSON, "w") as f:
        json.dump(payload, f, indent=4)
        
    print("➡️ Invoking local Evacuation Routing Engine...")
    
    # Run the test_graph as a subprocess inside the EVAC module directly
    try:
        result = subprocess.run(
            [EVAC_PYTHON, "-m", "evacuation.test_graph"], 
            cwd=EVAC_DIR, 
            check=True, 
            capture_output=True, 
            text=True
        )
        print("✅ Route generation complete.")
    except subprocess.CalledProcessError as e:
        print("❌ Routing engine failed!")
        print("Stdout:", e.stdout)
        print("Stderr:", e.stderr)
        return False
        
    # Read the output directions 
    if not os.path.exists(DIRECTIONS_JSON):
        print("❌ Routing engine succeeded but no directions JSON was found!")
        return False
        
    with open(DIRECTIONS_JSON, "r") as f:
        routes_data = json.load(f)
        
    steps = routes_data.get("directions", [])
    if not steps:
        print("❌ No valid route directions generated! Path might be blocked.")
        return False
        
    # Format Dynamic SMS
    sms_body = (
        f"🚨 SENTINEL EVACUATION ALERT 🚨\n"
        f"Threat: {str(doc.get('threat_type', 'UNKNOWN')).upper()}\n"
        f"Follow these generated directions immediately:\n"
    )
    
    # Add first few steps to SMS so we don't exceed Twilio bounds
    for s in steps[:4]: 
        sms_body += f"{s['step']}. {s['instruction']}\n"
        
    if len(steps) > 4:
        sms_body += f"...and {len(steps) - 4} more steps.\n"
        
    sms_body += f"Stay safe."
    
    # Send SMS via Twilio
    if twilio_client:
        try:
            message = twilio_client.messages.create(
                body=sms_body,
                from_=TWILIO_PHONE,
                to=doc.get('target_phone')
            )
            print(f"✅ SMS SENT to {doc.get('target_phone')} (SID: {message.sid})")
            
        except Exception as e:
            print(f"❌ Twilio Error: {e}")
            return False
    else:
        print(f"✅ SIMULATED SMS SENT:\n{sms_body}")

    # Update Firebase doc with the verified route
    db.collection('evac_orders').document(doc_id).update({
        'status': 'dispatched',
        'dispatched_at': firestore.SERVER_TIMESTAMP,
        'evacuation_route': routes_data
    })
    
    return True


def on_snapshot(col_snapshot, changes, read_time):
    for change in changes:
        if change.type.name == 'ADDED':
            doc = change.document.to_dict()
            doc_id = change.document.id
            
            if doc.get('status') == 'pending':
                print(f"🚨 EVAC ORDER RECEIVED! Processing route for {doc.get('target_phone')}...")
                success = process_evacuation_order(doc, doc_id)
                if not success:
                    db.collection('evac_orders').document(doc_id).update({
                        'status': 'failed',
                        'failed_at': firestore.SERVER_TIMESTAMP
                    })

col_query = db.collection('evac_orders')
watch = col_query.on_snapshot(on_snapshot)

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Dispatcher offline.")