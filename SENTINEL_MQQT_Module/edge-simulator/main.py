import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
BROKER = os.getenv('MQTT_BROKER')
PORT = int(os.getenv('MQTT_PORT', 8883))
TOPIC = os.getenv('MQTT_TOPIC', 'sentinel/alerts')
USERNAME = os.getenv('MQTT_USERNAME')
PASSWORD = os.getenv('MQTT_PASSWORD')

def generate_dummy_data():
    """Generate dummy intrusion detection data matching the intrusion_schema.json"""
    intrusion_types = ['person', 'drone', 'vehicle']
    camera_ids = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05']
    
    return {
        "camera_id": random.choice(camera_ids),
        "timestamp": datetime.utcnow().isoformat() + 'Z',
        "location": {
            "lat": 9.9312,
            "lng": 76.2673
        },
        "intrusion_type": random.choice(intrusion_types),
        "confidence": round(random.uniform(0, 100), 2)
    }

# Setup MQTT Client
client = mqtt.Client()
client.username_pw_set(USERNAME, PASSWORD)
client.tls_set()  # Enable TLS for HiveMQ

# Connect to the broker
client.connect(BROKER, PORT, 60)
client.loop_start()

try:
    while True:
        # Generate data
        data = generate_dummy_data()
        
        # Convert to JSON string
        json_data = json.dumps(data)
        
        # Publish to the topic
        client.publish('sentinel/alerts', json_data)
        
        # Print to console
        print(f' [x] Sent alert: {data["intrusion_type"]}')
        
        # Sleep for 5 seconds
        time.sleep(5)
except KeyboardInterrupt:
    print('\nStopping edge simulator...')
    client.loop_stop()
    client.disconnect()
