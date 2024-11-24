import { Protobuf } from '@meshtastic/js';
import { logInfo, logError } from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';

export function handleNodeInfoMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  try {
    const nodeInfo = Protobuf.Mesh.User.fromBinary(dataMessage.payload);

    // Update the cache
    const deviceEntry = getDeviceCacheEntry(identifier);
    deviceEntry.lastNodeInfo = nodeInfo;

    logInfo('NODEINFO_APP', {
      id: packet.id,
      from: identifier,
      to: packet.to.toString(16),
      data: nodeInfo.toJSON(),
    });
  } catch (error) {
    logError('Failed to parse NodeInfo message:', error);
  }
}
