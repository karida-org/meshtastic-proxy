import { Protobuf } from '@meshtastic/js';
import { logInfo } from '../utils/logger.js';

export function handleTextMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  const text = Buffer.from(dataMessage.payload).toString('utf-8');

  logInfo('TEXT_MESSAGE_APP', {
    id: packet.id,
    from: identifier,
    to: packet.to.toString(16),
    data: text,
  });
}
