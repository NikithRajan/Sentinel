import os
from dotenv import load_dotenv

# Force reload of .env file
load_dotenv(override=True)

BROKER = os.getenv('MQTT_BROKER')
PORT = os.getenv('MQTT_PORT')

print("\n--- DIAGNOSTIC REPORT ---")
if BROKER is None:
    print("❌ ERROR: BROKER is None. The .env file was not found or is empty.")
else:
    print(f"✅ BROKER loaded: '{BROKER}'")
    print(f"   Length: {len(BROKER)} characters")
    if " " in BROKER:
        print("   ⚠️ WARNING: Hidden spaces detected!")
    if "ssl://" in BROKER or "mqtt://" in BROKER:
        print("   ⚠️ WARNING: Protocol prefix detected (remove ssl://)")

print(f"✅ PORT loaded:   '{PORT}'")
print("-------------------------\n")