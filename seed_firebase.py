import firebase_admin
from firebase_admin import credentials, firestore
import random
import datetime

# --- CONFIGURATION ---
# Assumes this script is run from the `Sentinel/` root directory
KEY_PATH = 'SENTINEL_MQQT_Module/backend-dispatcher/serviceAccountKey.json'

try:
    cred = credentials.Certificate(KEY_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Failed to connect to Firebase. Did you put the serviceAccountKey.json at {KEY_PATH}? Error: {e}")
    exit(1)

# Fort Kochi Base Coordinates
BASE_LAT = 9.966
BASE_LNG = 76.244

INTRUSION_TYPES = ['person', 'vehicle', 'drone', 'unknown']

print("🌱 Seeding Firebase `intrusions` collection with 50 mock events...")

batch = db.batch()
for i in range(50):
    # Random historical dates over the last 30 days
    days_ago = random.randint(0, 30)
    hours_ago = random.randint(0, 23)
    minutes_ago = random.randint(0, 59)
    past_date = datetime.datetime.now() - datetime.timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
    
    # Slight geographic variance for heatmap clustering
    lat = BASE_LAT + (random.uniform(-1, 1) * 0.005)
    lng = BASE_LNG + (random.uniform(-1, 1) * 0.005)
    
    doc_ref = db.collection('intrusions').document()
    batch.set(doc_ref, {
        "intrusion_type": random.choice(INTRUSION_TYPES),
        "confidence": random.uniform(50.0, 99.9),
        "location": {
            "lat": lat,
            "lng": lng
        },
        "received_at": past_date,  # Uses Firebase Timestamp internally when pushed via Python
        "camera_name": f"FORT-KOCHI-SECTOR-{random.randint(1, 10)}"
    })

batch.commit()
print("✅ Successfully seeded 50 records! Check your military-dashboard UI.")
