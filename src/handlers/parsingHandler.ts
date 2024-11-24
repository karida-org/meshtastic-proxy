import { Protobuf } from '@meshtastic/js';
import { PortNum } from '../utils/types.js';
import { logInfo } from '../utils/logger.js';
import { handleTextMessage } from './textMessageHandler.js';
import { handlePositionMessage } from './positionHandler.js';
import { handleNodeInfoMessage } from './nodeInfoHandler.js';
import { handleTelemetryMessage } from './telemetryHandler.js';

/**
 * Parses a Data message and delegates to the appropriate handler
 * @param dataMessage
 * @param packet
 * @param serviceEnvelope
 */
export async function parseDataMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  serviceEnvelope: Protobuf.Mqtt.ServiceEnvelope
): Promise<void> {
  const { portnum } = dataMessage;
  const identifier = packet.from.toString(16); // Device identifier in hex

  switch (portnum) {
    case PortNum.TEXT_MESSAGE_APP:
      handleTextMessage(dataMessage, packet, identifier);
      break;

    case PortNum.POSITION_APP:
      await handlePositionMessage(dataMessage, packet, identifier);
      break;

    case PortNum.NODEINFO_APP:
      handleNodeInfoMessage(dataMessage, packet, identifier);
      break;

    case PortNum.TELEMETRY_APP:
      handleTelemetryMessage(dataMessage, packet, identifier);
      break;

    default:
      logInfo('Received Data Message with unknown portnum:', dataMessage);
      break;
  }
}
