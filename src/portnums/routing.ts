import { Protobuf } from '@meshtastic/js';
import logger from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';

/**
 * Handles incoming Routing messages
 * @param dataMessage
 * @param packet
 * @param identifier
 */
export function handleRoutingMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  try {
    const routing = Protobuf.Mesh.Routing.fromBinary(dataMessage.payload);

    // Update the cache
    const deviceEntry = getDeviceCacheEntry(identifier);
    deviceEntry.lastRouting = routing;
    deviceEntry.lastUpdateTime = Date.now();

    logger.debug('ROUTING_APP', {
      id: packet.id,
      from: identifier,
      to: packet.to.toString(16),
      data: routing.toJSON(),
    });
  } catch (error) {
    logger.warn('Failed to parse Routing message:', error);
  }
}
