import { DeviceCacheEntry } from './types.js';

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
