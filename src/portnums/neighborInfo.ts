import { Protobuf } from '@meshtastic/js';
import { logDebug, logWarn } from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';

/**
 * Handles incoming NeighborInfo messages
 * @param dataMessage
 * @param packet
 * @param identifier
 */
export function handleNeighborInfoMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  try {
    const neighborInfo = Protobuf.Mesh.NeighborInfo.fromBinary(dataMessage.payload);

    // Update the cache
    const deviceEntry = getDeviceCacheEntry(identifier);
    deviceEntry.lastNeighborInfo = neighborInfo;
    deviceEntry.lastUpdateTime = Date.now();

    logDebug('NEIGHBORINFO_APP', {
      id: packet.id,
      from: identifier,
      to: packet.to.toString(16),
      data: neighborInfo.toJSON(),
    });
  } catch (error) {
    logWarn('Failed to parse NeighborInfo message:', error);
  }
}
