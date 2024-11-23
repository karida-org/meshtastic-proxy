import { Protobuf } from '@meshtastic/js';
import crypto from 'crypto';
import { aesKeyBase64 } from '../config.js';

const AES_KEY = Buffer.from(aesKeyBase64, 'base64');

/**
 * Decrypts the payload of an encrypted MeshPacket
 * @param packet
 * @returns
 */
export function decryptPayload(packet: Protobuf.Mesh.MeshPacket): Buffer {

  // Extract packet ID and 'from' fields
  const packetId = packet.id;
  const fromId = packet.from;

  // Convert packetId and fromId to 8-byte little-endian buffers
  const packetIdBuffer = Buffer.alloc(8);
  packetIdBuffer.writeBigUInt64LE(BigInt(packetId));

  const fromIdBuffer = Buffer.alloc(8);
  fromIdBuffer.writeBigUInt64LE(BigInt(fromId));

  // Concatenate buffers to create nonce
  const nonce = Buffer.concat([packetIdBuffer, fromIdBuffer]);

  // Create cipher for decryption
  const decipher = crypto.createDecipheriv('aes-128-ctr', AES_KEY, nonce);

  // Decrypt the payload
  const decrypted = Buffer.concat([
    decipher.update(packet.payloadVariant.value as Buffer),
    decipher.final(),
  ]);

  return decrypted;
}
