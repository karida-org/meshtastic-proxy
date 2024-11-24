import { Protobuf } from '@meshtastic/js';
import { logInfo, logError } from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';

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
    }

    logInfo(`TELEMETRY_APP - ${variantType}`, {
      id: packet.id,
      from: identifier,
      to: packet.to.toString(16),
      time: new Date(telemetry.time * 1000),
      type: variantType,
      data: variantValue,
    });
  } catch (error) {
    logError('Failed to parse Telemetry message:', error);
  }
}
