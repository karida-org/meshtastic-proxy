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
export const traccarIdPrefix = process.env.TRACCAR_ID_PREFIX || 'msh-';

// AES encryption key
export const aesKeyBase64 = process.env.AES_KEY || '1PG7OiApB1nwvP+rz05pAQ=='; // default "AQ==" decryption key

// DuckDB path
export const duckdbPath = process.env.DUCKDB_PATH || 'data/meshtastic.db';

// FIWARE and WSO2 configuration
export const fiwareBroker = process.env.FIWARE_BROKER || 'https://fiware.example.com/orion/v2';
export const fiwareService = process.env.FIWARE_SERVICE || 'tenant_id';
export const fiwareServicePath = process.env.FIWARE_SERVICE_PATH || '/';
export const wso2AuthUrl = process.env.WSO2_AUTH_URL || 'https://wso2.example.com/oauth2/token';
export const wso2ConsumerKey = process.env.WSO2_CONSUMER_KEY || 'consumer_key';
export const wso2ConsumerSecret = process.env.WSO2_CONSUMER_SECRET || 'consumer_secret';

// Namespace for URN
export const urnNamespace = process.env.URN_NAMESPACE || 'meshtastic';
