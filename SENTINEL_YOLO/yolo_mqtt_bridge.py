import cv2
import time
import json
import ssl
import paho.mqtt.client as mqtt
from ultralytics import YOLO

# --- 1. MQTT CONFIGURATION ---
# ⚠️ REPLACE THESE WITH THE EXACT SAME CREDENTIALS FROM YOUR NODE.JS .env FILE
MQTT_BROKER = "09e6a28123184c6c8bfb50b2ff1a24e6.s1.eu.hivemq.cloud"  # e.g., "broker.hivemq.com"
MQTT_PORT = 8883                           # 8883 is standard for secure MQTT (MQTTS)
MQTT_TOPIC = "sentinel/alerts"
MQTT_USERNAME = "sentinel_server"       # Leave as "" if no username
MQTT_PASSWORD = "rUMMA3137"       # Leave as "" if no password

print("🔌 Connecting to MQTT Broker...")

# Setup MQTT Client
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

# Set username and password if your broker requires them
if MQTT_USERNAME and MQTT_PASSWORD:
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

# If using port 8883, we must enable TLS (Secure Connection)
if MQTT_PORT == 8883:
    client.tls_set(cert_reqs=ssl.CERT_NONE) # Allows connection without strict certificate verification

# Connect asynchronously and start the background thread so the camera doesn't freeze on bad WiFi
try:
    print("🔌 Attempting to resolve MQTT Broker...")
    client.connect_async(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()
except Exception as e:
    print(f"❌ Failed to connect to MQTT: {e}. Camera will still start.")

# --- 2. YOLO SETUP ---
MODEL_PATH = "best.pt" 
print("🧠 Loading YOLO Model...")
model = YOLO(MODEL_PATH)

# --- 3. CONFIGURATION ---
CAMERA_INDEX = 0
COOLDOWN_SECONDS = 5  
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
    print("🛡️ SENTINEL LIVE DETECTION W/ MQTT STARTED")
    print("   Press 'q' to quit")
    print("="*50 + "\n")

    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        results = model.predict(frame, conf=0.5, verbose=False)
        annotated_frame = results[0].plot()
        
        if results[0].boxes is not None and len(results[0].boxes) > 0:
            current_time = time.time()
            
            if current_time - last_alert_time > COOLDOWN_SECONDS:
                best_box = max(results[0].boxes, key=lambda b: float(b.conf))
                threat_class = model.names[int(best_box.cls)]
                confidence = float(best_box.conf) * 100 
                
                print(f"🚨 THREAT DETECTED: {threat_class} ({confidence:.1f}%). Publishing to MQTT...")
                
                # Format the JSON payload for server.js
                payload = {
                    "intrusion_type": threat_class.upper(),
                    "threat_type": threat_class.upper(), 
                    "confidence": round(confidence, 1),
                    "location": "Sector 1 (Live Cam)"
                }
                
                # Publish the message to the broker
                client.publish(MQTT_TOPIC, json.dumps(payload))
                print("✅ MQTT Publish successful.")
                last_alert_time = current_time 

        cv2.imshow("SENTINEL - Live Camera", annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("Shutting down Sentinel...")
            break

    cap.release()
    cv2.destroyAllWindows()
    client.loop_stop()
    client.disconnect()

if __name__ == "__main__":
    start_sentinel()