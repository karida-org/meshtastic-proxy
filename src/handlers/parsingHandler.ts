import { Protobuf } from '@meshtastic/js';
import { logInfo, logError } from '../utils/logger.js';
import { PortNum } from '../utils/types.js';

/**
 * Parses a Data message and logs the contents
 * @param dataMessage
 * @param packet
 * @param serviceEnvelope
 */
export function parseDataMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  serviceEnvelope: Protobuf.Mqtt.ServiceEnvelope
): void {
  const { portnum, payload, wantResponse } = dataMessage;

  switch (portnum) {
    case PortNum.TEXT_MESSAGE_APP:
      handleTextMessage(dataMessage, packet);
      break;

    case PortNum.POSITION_APP:
      handlePositionMessage(dataMessage, packet);
      break;

    case PortNum.NODEINFO_APP:
      handleNodeInfoMessage(dataMessage, packet);
      break;

    case PortNum.TELEMETRY_APP:
      handleTelemetryMessage(dataMessage, packet);
      break;

    default:
      logInfo("Received Data Message with unknown portnum:", dataMessage);
      break;
  }
}

function handleTextMessage(dataMessage: Protobuf.Mesh.Data, packet: Protobuf.Mesh.MeshPacket) {
  const text = Buffer.from(dataMessage.payload).toString('utf-8');
  logInfo("TEXT_MESSAGE_APP", {
    id: packet.id,
    to: packet.to.toString(16),
    from: packet.from.toString(16),
    data: text,
  });
}

function handlePositionMessage(dataMessage: Protobuf.Mesh.Data, packet: Protobuf.Mesh.MeshPacket) {
  try {
    const position = Protobuf.Mesh.Position.fromBinary(dataMessage.payload);
    const latitude = position.latitudeI * 1e-7;
    const longitude = position.longitudeI * 1e-7;
    const timestamp = new Date(position.time * 1000);

    logInfo("POSITION_APP", {
      id: packet.id,
      to: packet.to.toString(16),
      from: packet.from.toString(16),
      time: timestamp,
      latitude,
      longitude,
      altitude: position.altitude,
      data: position,
    });
  } catch (error) {
    logError("Failed to parse Position message:", error);
  }
}

function handleNodeInfoMessage(dataMessage: Protobuf.Mesh.Data, packet: Protobuf.Mesh.MeshPacket) {
  try {
    const nodeInfo = Protobuf.Mesh.User.fromBinary(dataMessage.payload);
    logInfo("NODEINFO_APP", {
      id: packet.id,
      to: packet.to.toString(16),
      from: packet.from.toString(16),
      user: {
        id: nodeInfo.id,
        longName: nodeInfo.longName,
        shortName: nodeInfo.shortName,
      },
    });
  } catch (error) {
    logError("Failed to parse NodeInfo message:", error);
  }
}

function handleTelemetryMessage(dataMessage: Protobuf.Mesh.Data, packet: Protobuf.Mesh.MeshPacket) {
  try {
    const telemetry = Protobuf.Telemetry.Telemetry.fromBinary(dataMessage.payload);
    const timestamp = new Date(telemetry.time * 1000);

    switch (telemetry.variant.case) {
      case 'deviceMetrics':
        logInfo("TELEMETRY_APP - Device Metrics", {
          id: packet.id,
          to: packet.to.toString(16),
          from: packet.from.toString(16),
          time: timestamp,
          data: telemetry.variant.value,
        });
        break;

      case 'environmentMetrics':
        logInfo("TELEMETRY_APP - Environment Metrics", {
          id: packet.id,
          to: packet.to.toString(16),
          from: packet.from.toString(16),
          time: timestamp,
          data: telemetry.variant.value,
        });
        break;

      default:
        logInfo("TELEMETRY_APP - Unknown Variant", telemetry);
        break;
    }
  } catch (error) {
    logError("Failed to parse Telemetry message:", error);
  }
}
