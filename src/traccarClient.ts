import axios from 'axios';
import { logInfo, logError } from './utils/logger.js';
import { traccarApiUrl, traccarApiToken } from './config.js';
import { getDeviceExists, setDeviceExists } from './utils/cache.js';

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
    logError('Failed to check device existence in Traccar', (error as any).response?.data || (error as any).message);
    return false;
  }
}

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
      logInfo(`Created device with identifier ${identifier}`);
      return true;
    } else {
      logError(`Failed to create device: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logError('Failed to create device in Traccar', (error as any).response?.data || (error as any).message);
    return false;
  }
}
