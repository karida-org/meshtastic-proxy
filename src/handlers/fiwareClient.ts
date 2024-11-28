import axios from 'axios';
import logger from '../utils/logger.js';
import { fiwareBroker, fiwareService, fiwareServicePath } from '../config.js';
import { getAccessToken } from '../utils/cache.js';

/**
 * Make a request to the FIWARE broker
 * @param endpoint
 * @returns
 */
export async function makeFiwareRequest(endpoint: string) {
  const token = await getAccessToken();
  const response = await axios.get(`${fiwareBroker}${endpoint}`, {
    headers: {
      'Fiware-Service': fiwareService,
      'Fiware-ServicePath': fiwareServicePath,
      'Authorization': `Bearer ${token}`
    }
  });

  logger.debug(`Fiware Broker response`, {
    method: 'GET',
    url: `${fiwareBroker}${endpoint}`,
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
    data: response.data
  });
  return response.data;
}

