import axios from 'axios';
import logger from '../utils/logger.js';
import { traccarApiUrl, traccarApiToken } from '../config.js';
import { getDeviceExists, setDeviceExists } from '../utils/cache.js';

/**
 * Check if a device exists in Traccar
 * @param identifier
 * @returns
 */
export async function checkDeviceExists(identifier: string): Promise<boolean> {
  // Check the cache first
  if (getDeviceExists(identifier)) {
    return true;
  }

  // Set up headers with the API token
  const headers = {
    'Authorization': `Bearer ${traccarApiToken}`,
  };

  try {
    const response = await axios.get(`${traccarApiUrl}/api/devices`, { headers });
    const devices = response.data;

    // Check if the device exists
    const device = devices.find((d: any) => d.uniqueId === identifier);

    if (device) {
      setDeviceExists(identifier, true);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.error('Failed to check device existence in Traccar', (error as any).response?.data || (error as any).message);
    return false;
  }
}

/**
 * Create a device in Traccar
 * @param identifier
 * @param deviceName
 * @returns
 */
export async function createDevice(identifier: string, deviceName: string): Promise<boolean> {
  // Set up headers with the API token
  const headers = {
    'Authorization': `Bearer ${traccarApiToken}`,
    'Content-Type': 'application/json',
  };

  const deviceData = {
    name: deviceName,
    uniqueId: identifier,
  };

  try {
    const response = await axios.post(`${traccarApiUrl}/api/devices`, deviceData, { headers });
    if (response.status === 200 || response.status === 201) {
      setDeviceExists(identifier, true);
      logger.info(`Created device with identifier ${identifier}`);
      return true;
    } else {
      logger.error(`Failed to create device: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logger.error('Failed to create device in Traccar', (error as any).response?.data || (error as any).message);
    return false;
  }
}
