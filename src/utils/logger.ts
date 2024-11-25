// src/utils/logger.ts
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import winston from 'winston';
import 'winston-daily-rotate-file';

dotenv.config();

// Use import.meta.url and fileURLToPath to get __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();

const logDirectory = path.join(__dirname, '../../logs');

// Ensure the logs directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Create a Winston logger instance
const logger = winston.createLogger({
  level: LOG_LEVEL,
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
  transports: [
    // Console output
    new winston.transports.Console(),

    // File output with daily rotation
    new winston.transports.DailyRotateFile({
      filename: path.join(logDirectory, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      zippedArchive: true,
    }),
  ],
});

// Create wrapper functions to match your existing API
export function logError(message: string, error?: any): void {
  if (error) {
    logger.error(`${message}: ${error.stack || error}`);
  } else {
    logger.error(message);
  }
}

export function logWarn(message: string, data?: any): void {
  if (data) {
    logger.warn(`${message}: ${JSON.stringify(data)}`);
  } else {
    logger.warn(message);
  }
}

export function logInfo(message: string, data?: any): void {
  if (data) {
    logger.info(`${message}: ${JSON.stringify(data)}`);
  } else {
    logger.info(message);
  }
}

export function logDebug(message: string, data?: any): void {
  if (data) {
    logger.debug(`${message}: ${JSON.stringify(data)}`);
  } else {
    logger.debug(message);
  }
}
