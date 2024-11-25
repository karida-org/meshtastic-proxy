import { Protobuf } from '@meshtastic/js';
import { logDebug, logWarn } from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';

/**
 * Handles incoming TraceRoute messages
 * @param dataMessage
 * @param packet
 * @param identifier
 */
export function handleTraceRouteMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  try {
    const traceRoute = Protobuf.Mesh.RouteDiscovery.fromBinary(dataMessage.payload);

    // Update the cache
    const deviceEntry = getDeviceCacheEntry(identifier);
    deviceEntry.lastTraceRoute = traceRoute;
    deviceEntry.lastUpdateTime = Date.now();

    logDebug('TRACEROUTE_APP', {
      id: packet.id,
      from: identifier,
      to: packet.to.toString(16),
      data: traceRoute.toJSON(),
    });
  } catch (error) {
    logWarn('Failed to parse TraceRoute message:', error);
  }
}
