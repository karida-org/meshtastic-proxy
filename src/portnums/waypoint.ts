import { Protobuf } from '@meshtastic/js';
import logger from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';

/**
 * Handles incoming Waypoint messages
 * @param dataMessage
 * @param packet
 * @param identifier
 */
export function handleWaypointMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  try {
    const waypoint = Protobuf.Mesh.Waypoint.fromBinary(dataMessage.payload);

    // Update the cache
    const deviceEntry = getDeviceCacheEntry(identifier);
    deviceEntry.lastWaypoint = waypoint;
    deviceEntry.lastUpdateTime = Date.now();

    logger.debug('WAYPOINT_APP', {
      id: packet.id,
      from: identifier,
      to: packet.to.toString(16),
      data: waypoint.toJSON(),
    });
  } catch (error) {
    logger.warn('Failed to parse Waypoint message:', error);
  }
}
