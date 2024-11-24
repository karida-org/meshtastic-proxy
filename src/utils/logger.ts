import dotenv from 'dotenv';
import { LogLevel } from './types.js';

dotenv.config();

const LOG_LEVEL = (process.env.LOG_LEVEL || 'INFO').toUpperCase() as LogLevel;

const levels: { [key in LogLevel]: number } = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
};

const currentLogLevel = levels[LOG_LEVEL] ?? levels.INFO;

/**
 * Log error message to console
 * @param message
 * @param error
 */
export function logError(message: string, error?: any): void {
  if (currentLogLevel >= levels.ERROR) {
    if (error) {
      console.error(`[ERROR] ${message}:`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }
}

/**
 * Log warning message to console
 * @param message
 * @param data
 */
export function logWarn(message: string, data?: any): void {
  if (currentLogLevel >= levels.WARN) {
    if (data) {
      console.warn(`[WARN] ${message}:`, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  }
}

/**
 * Log info message to console
 * @param message
 * @param data
 */
export function logInfo(message: string, data?: any): void {
  if (currentLogLevel >= levels.INFO) {
    if (data) {
      console.log(`[INFO] ${message}:`, data);
    } else {
      console.log(`[INFO] ${message}`);
    }
  }
}

/**
 * Log debug message to console
 * @param message
 * @param data
 */
export function logDebug(message: string, data?: any): void {
  if (currentLogLevel >= levels.DEBUG) {
    if (data) {
      console.debug(`[DEBUG] ${message}:`, data);
    } else {
      console.debug(`[DEBUG] ${message}`);
    }
  }
}
