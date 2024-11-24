import { Protobuf } from '@meshtastic/js';
import axios from 'axios';
import { traccarOsmAndUrl } from '../config.js';
import { checkDeviceExists, createDevice } from '../handlers/traccarClient.js';
import { logInfo, logError } from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';

export async function handlePositionMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  try {
    const position = Protobuf.Mesh.Position.fromBinary(dataMessage.payload);
    const latitude = position.latitudeI * 1e-7;
    const longitude = position.longitudeI * 1e-7;
    const altitude = position.altitude;
    const timestamp = position.time * 1000; // timestamp in milliseconds

    // Update the cache
    const deviceEntry = getDeviceCacheEntry(identifier);
    deviceEntry.lastPosition = position;
    deviceEntry.lastUpdateTime = Date.now();

    // Retrieve the cached battery level (if available)
    const batteryLevel = deviceEntry.lastDeviceMetrics?.batteryLevel ?? position.batteryLevel;

    // Log the position
    logInfo('POSITION_APP', {
      id: packet.id,
      from: identifier,
      to: packet.to.toString(16),
      time: new Date(timestamp),
      batteryLevel: batteryLevel,
      geojson: {
        type: 'Point',
        coordinates: [longitude, latitude, altitude],
      },
      data: position.toJSON(),
    });

    // Check if device exists in Traccar
    const deviceExists = await checkDeviceExists(identifier);

    if (!deviceExists) {
      logError(`Device with identifier ${identifier} does not exist in Traccar.`);
      // Optionally, create the device
      const deviceName = deviceEntry.lastNodeInfo?.longName || `Device ${identifier}`;
      const created = await createDevice(identifier, deviceName);
      if (!created) {
        logError(`Failed to create device with identifier ${identifier}. Skipping position update.`);
        return;
      }
    }

    // Build the OsmAnd protocol parameters
    const params: Record<string, string> = {
      id: identifier,
      lat: latitude.toString(),
      lon: longitude.toString(),
      timestamp: timestamp.toString(),
      altitude: altitude.toString(),
      speed: (position.groundSpeed || 0).toString(),
      bearing: (position.groundTrack || 0).toString(),
      accuracy: (position.gpsAccuracy || 0).toString(),
      batt: batteryLevel !== undefined ? batteryLevel.toString() : undefined,
      // Include additional parameters as needed
    };

    // Remove undefined parameters
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    // Construct the request URL using the configured OsmAnd URL
    const osmandUrl = `${traccarOsmAndUrl}/?${new URLSearchParams(params).toString()}`;

    // Send the request without authentication
    try {
      const response = await axios.get(osmandUrl);
      logInfo(`Position sent to Traccar for device ${identifier}`, response.data);
    } catch (error) {
      logError(
        `Failed to send position to Traccar for device ${identifier}`,
        (error as any).response?.data || (error as any).message
      );
    }
  } catch (error) {
    logError('Failed to parse Position message:', error);
  }
}
