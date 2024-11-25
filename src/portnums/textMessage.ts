import { Protobuf } from '@meshtastic/js';
import { logDebug } from '../utils/logger.js';

/**
 * Handles incoming Text messages
 * @param dataMessage
 * @param packet
 * @param identifier
 */
export function handleTextMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  const text = Buffer.from(dataMessage.payload).toString('utf-8');

  logDebug('TEXT_MESSAGE_APP', {
    id: packet.id,
    from: identifier,
    to: packet.to.toString(16),
    data: text,
  });
}
