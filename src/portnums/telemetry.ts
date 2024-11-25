import { Protobuf } from '@meshtastic/js';
import { logDebug, logWarn } from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';

/**
 * Handles incoming Telemetry messages
 * @param dataMessage
 * @param packet
 * @param identifier
 */
export function handleTelemetryMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  try {
    const telemetry = Protobuf.Telemetry.Telemetry.fromBinary(dataMessage.payload);

    // Get the variant type (e.g., 'deviceMetrics', 'environmentMetrics')
    const variantType = telemetry.variant.case;

    // Convert the variant value to a plain object
    const variantValue = telemetry.variant.value.toJSON();

    // Update the cache based on the variant type
    const deviceEntry = getDeviceCacheEntry(identifier);
    if (variantType === 'deviceMetrics') {
      deviceEntry.lastDeviceMetrics = telemetry.variant.value as Protobuf.Telemetry.DeviceMetrics;
    } else if (variantType === 'environmentMetrics') {
      deviceEntry.lastEnvironmentMetrics = telemetry.variant.value as Protobuf.Telemetry.EnvironmentMetrics;
    } else if (variantType === 'powerMetrics') {
      deviceEntry.lastPowerMetrics = telemetry.variant.value as Protobuf.Telemetry.PowerMetrics;
    }

    logDebug(`TELEMETRY_APP - ${variantType}`, {
      id: packet.id,
      from: identifier,
      to: packet.to.toString(16),
      time: new Date(telemetry.time * 1000),
      type: variantType,
      data: variantValue,
    });
  } catch (error) {
    logWarn('Failed to parse Telemetry message:', error);
  }
}
