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

// Create a Winston logger instance
const logger = winston.createLogger({
  level: LOG_LEVEL,
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json() // Output logs in JSON format
  ),
  defaultMeta: { service: 'meshtastic-proxy' }, // Add default metadata
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
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDirectory, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDirectory, 'rejections.log') }),
  ],
});

export default logger;
