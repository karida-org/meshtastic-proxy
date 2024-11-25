import { Protobuf } from '@meshtastic/js';
import crypto from 'crypto';
import { aesKeyBase64 } from '../config.js';
import logger from '../utils/logger.js';

const KEY = Buffer.from(aesKeyBase64, 'base64');

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

  // Determine algorithm based on key length
  let algorithm: string = '';
  if (KEY.length === 16) {
    algorithm = 'aes-128-ctr';
  } else if (KEY.length === 32) {
    algorithm = 'aes-256-ctr';
  } else {
    logger.error('Invalid key length');
  }

  // Create cipher for decryption
  const decipher = crypto.createDecipheriv(algorithm, KEY, nonce);

  // Decrypt the payload
  const decrypted = Buffer.concat([
    decipher.update(packet.payloadVariant.value as Buffer),
    decipher.final(),
  ]);

  return decrypted;
}
