/**
 * Log info message to console
 * @param message
 * @param data
 */
export function logInfo(message: string, data?: any): void {
  if (data) {
    console.log(`${message}:`, data);
  } else {
    console.log(message);
  }
}

/**
 * Log error message to console
 * @param message
 * @param error
 */
export function logError(message: string, error?: any): void {
  if (error) {
    console.error(`${message}:`, error);
  } else {
    console.error(message);
  }
}
