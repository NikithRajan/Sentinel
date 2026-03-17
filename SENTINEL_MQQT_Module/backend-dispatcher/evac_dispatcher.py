import firebase_admin
from firebase_admin import credentials, firestore
from twilio.rest import Client
import time

# --- 1. TWILIO CONFIGURATION ---
TWILIO_SID = os.getenv('TWILIO_SID')
TWILIO_AUTH = os.getenv('TWILIO_AUTH')
TWILIO_PHONE = os.getenv('TWILIO_PHONE')

# --- 2. FIREBASE CONFIGURATION ---
# Make sure the JSON file is in the same folder as this script
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
twilio_client = Client(TWILIO_SID, TWILIO_AUTH)

print("📡 DISPATCHER ONLINE: Listening for Evacuation Orders...")

def on_snapshot(col_snapshot, changes, read_time):
    for change in changes:
        if change.type.name == 'ADDED':
            doc = change.document.to_dict()
            doc_id = change.document.id
            
            if doc.get('status') == 'pending':
                print(f"🚨 EVAC ORDER RECEIVED! Sending SMS to {doc.get('target_phone')}")
                
                message_body = (
                    f"⚠️ SENTINEL ALERT: {str(doc.get('threat_type')).upper()} DETECTED.\n"
                    f"Immediate evacuation required.\n"
                    f"Safe Route: {doc.get('evac_route_url')}"
                )
                
                try:
                    message = twilio_client.messages.create(
                        body=message_body,
                        from_=TWILIO_PHONE,
                        to=doc.get('target_phone') # Make sure this matches your verified personal number!
                    )
                    print(f"✅ SMS SENT (Message SID: {message.sid})")
                    
                    db.collection('evac_orders').document(doc_id).update({
                        'status': 'dispatched',
                        'dispatched_at': firestore.SERVER_TIMESTAMP
                    })
                except Exception as e:
                    print(f"❌ SMS FAILED: {e}")

# Start listening
col_query = db.collection('evac_orders')
watch = col_query.on_snapshot(on_snapshot)

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Dispatcher offline.")