import mqtt, { IClientOptions, MqttClient } from 'mqtt';
import { brokerUrl, topic, username, password } from './config.js';
import { handleMessage } from './handlers/messageHandler.js';
import { logError, logInfo } from './utils/logger.js';

// MQTT client options
const options: IClientOptions = {
  username,
  password,
};

// Create an MQTT client and connect to the broker using the options
export const client: MqttClient = mqtt.connect(brokerUrl, options);

// When connected, subscribe to the topic
client.on('connect', () => {
  logInfo(`Connected to MQTT broker at ${brokerUrl}`);
  client.subscribe(topic, (err) => {
    if (err) {
      logError(`Failed to subscribe to topic "${topic}":`, err);
    } else {
      logInfo(`Subscribed to topic "${topic}"`);
    }
  });
});

// Listen for messages on the subscribed topic
client.on('message', handleMessage);

// Handle connection errors
client.on('error', (err) => {
  logError('Connection error:', err);
  client.end();
});
