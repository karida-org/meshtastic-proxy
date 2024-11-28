import axios from 'axios';
import { wso2AuthUrl, wso2ConsumerKey, wso2ConsumerSecret } from '../config.js';
import { DeviceCacheEntry, AccessTokenCache } from './types.js';

// Cache for access token data
let fiwareAccessTokenCache: AccessTokenCache | null = null;

// Function to fetch a new access token from WSO2
// Todo: make this work for other OAuth2 providers if necessary
async function fetchAccessToken(): Promise<string> {
  const authHeader = `Basic ${Buffer.from(`${wso2ConsumerKey}:${wso2ConsumerSecret}`).toString('base64')}`;
  const response = await axios.post(wso2AuthUrl, 'grant_type=client_credentials', {
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const { access_token, expires_in } = response.data;
  const expiresAt = Date.now() + expires_in * 1000;

  fiwareAccessTokenCache = { token: access_token, expiresAt };
  return access_token;
}

// Function to get an access token from cache or fetch a new one
export async function getAccessToken(): Promise<string> {
  if (!fiwareAccessTokenCache || Date.now() >= fiwareAccessTokenCache.expiresAt) {
    return fetchAccessToken();
  }
  return fiwareAccessTokenCache.token;
}

// Cache for device data, keyed by device identifier
const deviceCache: { [identifier: string]: DeviceCacheEntry } = {};

// Cache for device existence in Traccar
const deviceExistsCache: { [identifier: string]: boolean } = {};

// Function to get or create a cache entry for a device
export function getDeviceCacheEntry(identifier: string): DeviceCacheEntry {
  if (!deviceCache[identifier]) {
    deviceCache[identifier] = {};
  }
  return deviceCache[identifier];
}

// Function to set device existence in cache
export function setDeviceExists(identifier: string, exists: boolean): void {
  deviceExistsCache[identifier] = exists;
}

// Function to check if device exists in cache
export function getDeviceExists(identifier: string): boolean {
  return deviceExistsCache[identifier] || false;
}

// Function to clean up stale cache entries (if needed)
export function cleanUpDeviceCache(expirationTimeMs: number): void {
  const now = Date.now();
  for (const identifier in deviceCache) {
    const entry = deviceCache[identifier];
    if (entry.lastUpdateTime && now - entry.lastUpdateTime > expirationTimeMs) {
      delete deviceCache[identifier];
    }
  }
}
