import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// MQTT broker connection details
export const brokerUrl = process.env.MQTT_CONNECTION || 'mqtt://localhost:1883';
export const topic = process.env.MQTT_TOPIC || 'meshtastic/#';
export const username = process.env.MQTT_USERNAME || '';
export const password = process.env.MQTT_PASSWORD || '';

// Traccar server connection details
export const traccarApiUrl = process.env.TRACCAR_API_URL || 'http://your.traccar.server:8082';
export const traccarOsmAndUrl = process.env.TRACCAR_OSMAND_URL || 'http://your.traccar.server:5055';
export const traccarApiToken = process.env.TRACCAR_API_TOKEN || '';

// AES encryption key
export const aesKeyBase64 = process.env.AES_KEY || '1PG7OiApB1nwvP+rz05pAQ=='; // default "AQ==" decryption key
