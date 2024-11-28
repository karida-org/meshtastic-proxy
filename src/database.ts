import duckdb from 'duckdb';
import { duckdbPath } from './config.js';
import logger from './utils/logger.js';

import { initNodeInfoDatabase } from './portnums/nodeInfo.js';

// Initialize DuckDB connection
const db = new duckdb.Database(duckdbPath || ':memory:');
const connection = db.connect();

// Ensure the database connection is established
connection.run('SELECT 1', (err) => {
  if (err) {
    logger.error('Failed to establish DuckDB connection:', err);
  } else {
    logger.info('DuckDB connection established');
    initNodeInfoDatabase();
  }
});

export { connection };
