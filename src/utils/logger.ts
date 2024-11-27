import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import winston from 'winston';
import 'winston-daily-rotate-file';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();

const logDirectory = path.join(__dirname, '../../logs');

// Ensure the logs directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Define custom log levels (optional if using Winston's defaults)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define the format for the console (human-readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(), // Add colors
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Define the format for the file (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create a Winston logger instance
const logger = winston.createLogger({
  level: LOG_LEVEL,
  levels,
  defaultMeta: { service: 'meshtastic-proxy' },
  transports: [
    // Console output with human-readable format
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // File output with JSON format and daily rotation
    new winston.transports.DailyRotateFile({
      filename: path.join(logDirectory, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      format: fileFormat,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDirectory, 'exceptions.log'),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDirectory, 'rejections.log'),
      format: fileFormat,
    }),
  ],
});

export default logger;
