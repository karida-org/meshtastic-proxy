import axios from 'axios';
import logger from '../utils/logger.js';
import { fiwareBroker, fiwareService, fiwareServicePath, urnNamespace } from '../config.js';
import { getAccessToken } from '../utils/cache.js';

/**
 * Constructs the deviceId URN for a given identifier
 * @param identifier - Unique device identifier
 * @param entityName - Entity name (default: 'Device')
 * @returns deviceId URN
 */
function constructEntityURN(identifier: string, entityName: string = 'Device'): string {
  return `urn:ngsi-ld:${entityName}:${urnNamespace}:${identifier}`;
}

/**
 * Makes a request to the FIWARE broker
 * @param endpoint - API endpoint
 * @param data - Payload for the request
 * @param method - HTTP method (default: 'GET')
 * @param contentType - Optional Content-Type header
 * @returns
 */
async function makeFiwareRequest(endpoint: string, data?: any, method: string = 'GET', contentType?: string) {
  const token = await getAccessToken();
  const headers: { [key: string]: string } = {
    'Fiware-Service': fiwareService,
    'Fiware-ServicePath': fiwareServicePath,
    'Authorization': `Bearer ${token}`,
  };
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const response = await axios({
    method,
    url: `${fiwareBroker}${endpoint}`,
    headers,
    data,
  });

  logger.debug(`FIWARE Broker response`, {
    method,
    url: `${fiwareBroker}${endpoint}`,
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
    data: response.data,
  });

  return response.data;
}

/**
 * Upserts entities using batch operations.
 * Creates entities if they do not exist or updates their attributes if they exist.
 * @param entities - Array of entities to upsert
 * @returns Response from the FIWARE Context Broker
 */
export async function upsertEntitiesBatch(entities: Array<{ id: string; type: string; [key: string]: any }>) {
  const endpoint = '/op/update';
  const payload = {
    actionType: 'append', // "append" for upsert functionality
    entities,
  };

  try {
    const response = await makeFiwareRequest(endpoint, payload, 'POST', 'application/json');
    logger.debug('FIWARE batch operation successful', { response });
    logger.info(`Upserted ${entities.length} entities to FIWARE Context Broker.`);

    // Make a GET request to query all entities for debugging purposes
    // const queryResponse = await makeFiwareRequest('/entities', undefined, 'GET');
    // console.log('FIWARE entities:', queryResponse);
    return response;
  } catch (error: any) {
    logger.error('FIWARE batch operation failed', { error });
    throw error;
  }
}

/**
 * Upserts a Device entity in FIWARE.
 * Attempts to PATCH attributes and, if the entity does not exist, creates it with POST.
 * @param identifier - Unique device identifier
 * @param type - Entity type (default: Device)
 * @param attributes - Additional attributes to add to the entity
 */
export async function upsertDeviceEntity(identifier: string, type: string = 'Device', data: object = {}) {
  const entityId = constructEntityURN(identifier, type);
  const attributes = formatAttributes(data);

  // Prepare the entity object
  const entity = {
    id: entityId,
    type,
    ...attributes, // Include all provided attributes
  };

  // Use batch operation for upsert
  await upsertEntitiesBatch([entity]);
}

/**
 * Generates attribute data payload for FIWARE
 * @param jsonData - The data as a plain JSON object
 * @returns data payload for FIWARE
 */
function formatAttributes(jsonData: any): { [key: string]: { value: any, type: string } } {
  const data: { [key: string]: { value: any, type: string } } = {};

  Object.entries(jsonData).forEach(([key, value]) => {
    let type = "Text"; // Default to Text if the type isn't recognized

    // Map JavaScript types to FIWARE types
    if (typeof value === 'number') {
      type = "Number";
    } else if (typeof value === 'string') {
      type = "Text";
    } else if (typeof value === 'boolean') {
      type = "Boolean";
    } else if (typeof value === 'object' && value !== null) {
      type = "StructuredValue"; // For nested objects
    } else {
      logger.warn(`Unsupported data type for attribute: ${key}, value: ${value}`);
      return; // Skip unsupported types
    }

    data[key] = { value, type };
  });

  return data;
}
