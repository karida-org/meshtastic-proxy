import { Protobuf } from '@meshtastic/js';
import logger from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';
import { upsertDeviceEntity } from '../handlers/fiwareClient.js';

/**
 * Handles incoming Telemetry messages
 * @param dataMessage
 * @param packet
 * @param identifier
 */
export async function handleTelemetryMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  try {
    const telemetry = Protobuf.Telemetry.Telemetry.fromBinary(dataMessage.payload);

    // Get the variant type (e.g., 'deviceMetrics', 'environmentMetrics')
    const variantType = telemetry.variant.case;
    const variantValue = telemetry.variant.value.toJSON();

    // Update the cache based on the variant type
    const deviceEntry = getDeviceCacheEntry(identifier);

    switch (variantType) {
      case 'deviceMetrics':
        deviceEntry.lastDeviceMetrics = telemetry.variant.value as Protobuf.Telemetry.DeviceMetrics;
        break;

      case 'environmentMetrics':
        deviceEntry.lastEnvironmentMetrics = telemetry.variant.value as Protobuf.Telemetry.EnvironmentMetrics;
          break;

      case 'powerMetrics':
        deviceEntry.lastPowerMetrics = telemetry.variant.value as Protobuf.Telemetry.PowerMetrics;

        break;

      default:
        break;
    }

    // Update the device entity in the FIWARE Context Broker
    upsertDeviceEntity(identifier, 'Device', variantValue);

    logger.debug(`TELEMETRY_APP - ${variantType}`, {
      id: packet.id,
      from: identifier,
      to: packet.to.toString(16),
      time: new Date(telemetry.time * 1000),
      type: variantType,
      data: variantValue
    });
  } catch (error) {
    logger.warn('Failed to parse Telemetry message:', error);
  }
}

