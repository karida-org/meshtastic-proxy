import { Protobuf } from '@meshtastic/js';
import { decryptPayload } from './decryptionHandler.js';
import { parseDataMessage } from './parsingHandler.js';
import { logError } from '../utils/logger.js';

/**
 * Handles incoming messages from the MQTT broker
 * @param topic
 * @param payload
 */
export function handleMessage(topic: string, payload: Buffer): void {

  // In case we just want to handle it as a MeshPacket message
  try {
    const meshPacket = Protobuf.Mesh.MeshPacket.fromBinary(payload);
    // console.log("Received MeshPacket:", meshPacket);
  } catch (error) {
    // Handle parsing errors if necessary
  }

  // In case this is a ServiceEnvelope message
  try {
    const serviceEnvelope = Protobuf.Mqtt.ServiceEnvelope.fromBinary(payload);
    console.log("Received ServiceEnvelope:", {
      channelId: serviceEnvelope.channelId,
      gatewayId: serviceEnvelope.gatewayId,
    });

    // In case this is a MeshPacket message inside the ServiceEnvelope
    if (serviceEnvelope.packet) {
      const packet = serviceEnvelope.packet;
      const { case: variantCase, value: variantValue } = packet.payloadVariant;

      if (variantCase === 'encrypted') {
        // Attempt to decrypt the packet if it is encrypted
        try {
          const decryptedPayload = decryptPayload(packet);
          const dataMessage = Protobuf.Mesh.Data.fromBinary(decryptedPayload);
          parseDataMessage(dataMessage, packet, serviceEnvelope);
        } catch (error) {
          logError("Failed to decrypt packet:", error);
        }
      } else if (variantCase === 'decrypted') {
        // Handle decrypted packets if necessary
      }
    }
  } catch (error) {
    // Handle parsing errors if necessary
  }

  // In case this is a MapReport message
  try {
    const mapReport = Protobuf.Mqtt.MapReport.fromBinary(payload);
    // console.log("Received MapReport:", mapReport);
  } catch (error) {
    // Handle parsing errors if necessary
  }
}
