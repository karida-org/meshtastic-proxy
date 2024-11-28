import logger from './utils/logger.js';

logger.info("Connecting to DuckDB database...");
import './database.js';

logger.info("Starting MQTT Client connection...");
import './mqttClient.js';
