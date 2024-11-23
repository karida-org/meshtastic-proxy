import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// MQTT broker connection details
export const brokerUrl = process.env.MQTT_CONNECTION || 'mqtt://localhost:1883';
export const topic = process.env.MQTT_TOPIC || 'meshtastic/#';
export const username = process.env.MQTT_USERNAME || '';
export const password = process.env.MQTT_PASSWORD || '';

// AES encryption key
export const aesKeyBase64 = process.env.AES_KEY || '1PG7OiApB1nwvP+rz05pAQ=='; // default "AQ==" decryption key
