import cv2
import time
import firebase_admin
from firebase_admin import credentials, firestore
from ultralytics import YOLO

# --- 1. FIREBASE SETUP ---
print("🔌 Connecting to Firebase...")
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
print("✅ Firebase Connected!")

# --- 2. YOLO SETUP ---
MODEL_PATH = "best.pt" # Make sure this matches your model name
print("🧠 Loading YOLO Model...")
model = YOLO(MODEL_PATH)

# --- 3. CONFIGURATION ---
CAMERA_INDEX = 0
COOLDOWN_SECONDS = 5  # Wait 5 seconds before sending another alert to Firebase
last_alert_time = 0

def start_sentinel():
    global last_alert_time
    
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print("❌ Cannot open camera")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    print("\n" + "="*50)
    print("🛡️ SENTINEL LIVE DETECTION W/ FIREBASE STARTED")
    print("   Press 'q' to quit")
    print("="*50 + "\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Run YOLO detection
        results = model.predict(frame, conf=0.5, verbose=False)
        annotated_frame = results[0].plot()
        
        # Check if we detected anything
        if results[0].boxes is not None and len(results[0].boxes) > 0:
            current_time = time.time()
            
            # If cooldown has passed, send to Firebase
            if current_time - last_alert_time > COOLDOWN_SECONDS:
                
                # Find the object with the highest confidence in this frame
                best_box = max(results[0].boxes, key=lambda b: float(b.conf))
                threat_class = model.names[int(best_box.cls)]
                confidence = float(best_box.conf) * 100 # Convert to percentage
                
                print(f"🚨 THREAT DETECTED: {threat_class} ({confidence:.1f}%). Transmitting to Command Center...")
                
                try:
                    # Push directly to the React dashboard's database
                    db.collection('intrusions').add({
                        'threat_type': threat_class.upper(),
                        'confidence': round(confidence, 1),
                        'location': 'Sector 1 (Live Cam)',
                        'timestamp': firestore.SERVER_TIMESTAMP,
                        'status': 'active'
                    })
                    print("✅ Transmission successful.")
                    last_alert_time = current_time # Reset the cooldown timer
                except Exception as e:
                    print(f"❌ Transmission failed: {e}")

        # Show the live feed window
        cv2.imshow("SENTINEL - Live Camera", annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("Shutting down Sentinel...")
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    start_sentinel()