import { Protobuf } from '@meshtastic/js';
import { PortNum } from '../utils/types.js';
import logger from '../utils/logger.js';
import { handleTextMessage } from '../portnums/textMessage.js';
import { handlePositionMessage } from '../portnums/position.js';
import { handleNodeInfoMessage } from '../portnums/nodeInfo.js';
import { handleTelemetryMessage } from '../portnums/telemetry.js';
import { handleWaypointMessage } from '../portnums/waypoint.js';
import { handleNeighborInfoMessage } from '../portnums/neighborInfo.js';
import { handleTraceRouteMessage } from '../portnums/traceroute.js';
import { handleMapReportMessage } from '../portnums/mapreport.js';

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
  const channelId = serviceEnvelope.channelId.toString(16);
  const gatewayId = serviceEnvelope.gatewayId.toString(16);

  logger.info(`Received Data Message on ${channelId} (via ${gatewayId})`, {
    device: identifier,
    message: PortNum[portnum]
  });

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

    case PortNum.WAYPOINT_APP:
      handleWaypointMessage(dataMessage, packet, identifier);
      break;

    case PortNum.NEIGHBORINFO_APP:
      handleNeighborInfoMessage(dataMessage, packet, identifier);
      break;

    case PortNum.TRACEROUTE_APP:
      handleTraceRouteMessage(dataMessage, packet, identifier);
      break;

    case PortNum.MAP_REPORT_APP:
      handleMapReportMessage(dataMessage, packet, identifier);
      break;

    default:
      logger.info('Received Data Message with unknown portnum:', dataMessage);
      break;
  }
}
