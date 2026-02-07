require('dotenv').config();
const admin = require('firebase-admin');
const mqtt = require('mqtt');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Connect to Firestore
const db = admin.firestore();

// Load environment variables
const MQTT_BROKER = process.env.MQTT_BROKER;
const MQTT_PORT = parseInt(process.env.MQTT_PORT || '8883');
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'sentinel/alerts';
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

// MQTT Connection options with TLS
const mqttOptions = {
  host: MQTT_BROKER,
  port: MQTT_PORT,
  protocol: 'mqtts', // MQTT over TLS
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  rejectUnauthorized: false // Set to true in production with proper certificates
};

// Connect to MQTT broker
const client = mqtt.connect(mqttOptions);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  console.log(`Subscribing to topic: ${MQTT_TOPIC}`);
  client.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error('Error subscribing to topic:', err);
    } else {
      console.log(`Successfully subscribed to ${MQTT_TOPIC}`);
    }
  });
});

client.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

// Message handler
client.on('message', async (topic, message) => {
  try {
    // Parse JSON
    const data = JSON.parse(message.toString());
    
    // Log received alert
    console.log('Received Alert!');
    
    // Add status and received_at fields
    const intrusionData = {
      ...data,
      status: 'pending',
      received_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Save to Firestore collection 'intrusions'
    await db.collection('intrusions').add(intrusionData);
    
    console.log('Alert saved to Firestore:', data.intrusion_type || 'unknown');
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      // JSON parsing error
      console.error('JSON parsing error:', error.message);
      console.error('Received message:', message.toString());
    } else {
      // Database error
      console.error('Database error:', error.message);
      console.error('Error details:', error);
    }
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down backend bridge...');
  client.end();
  process.exit(0);
});

console.log('Backend bridge server starting...');
