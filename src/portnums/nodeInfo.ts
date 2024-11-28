import { Protobuf } from '@meshtastic/js';
import logger from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';
import { connection } from '../database.js';
import test from 'node:test';

/**
 * Initializes the NodeInfo database table
 */
export function initNodeInfoDatabase() {
  connection.run(
    `
    CREATE TABLE IF NOT EXISTS NodeInfo (
      id TEXT PRIMARY KEY,
      longName TEXT,
      shortName TEXT,
      hwModel TEXT,
      role TEXT,
      data JSON,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
    `,
    (err) => {
      if (err) {
        logger.error('Failed to create NodeInfo table in DuckDB:', err);
      } else {
        logger.debug('NodeInfo table created or already exists in DuckDB');
      }
    }
  );
}

function insertNodeInfo(identifier: string, data: Protobuf.Mesh.User) {

  const json = data.toJSON();

  connection.run(
    `
    INSERT INTO NodeInfo (id, longName, shortName, hwModel, role, data)
    VALUES (?::TEXT, ?::Text, ?::Text, ?::TEXT, ?::TEXT, ?::JSON)
    ON CONFLICT(id) DO UPDATE SET
      longName = excluded.longName,
      shortName = excluded.shortName,
      hwModel = excluded.hwModel,
      role = excluded.role,
      data = excluded.data::JSON,
      updated_at = NOW()
    `,
    identifier, json.longName, json.shortName, json.hwModel, json.role, JSON.stringify(json),
    (err) => {
      if (err) {
        logger.error('Failed to insert NodeInfo data:', err);
      } else {
        logger.debug('NodeInfo data inserted successfully');
      }
    }
  );

  if (logger.level === 'debug') {
    connection.all(`SELECT id, longName, shortName, hwModel, role, created_at, updated_at FROM NodeInfo`,
      (err, rows) => {
        if (err) {
          logger.error('Failed to fetch NodeInfo data:', err);
        } else {
          logger.debug('NodeInfo data fetched successfully:', rows);
        }
      }
    );
  }
}

/**
 * Handles incoming NodeInfo messages
 * @param dataMessage
 * @param packet
 * @param identifier
 */
export function handleNodeInfoMessage(
  dataMessage: Protobuf.Mesh.Data,
  packet: Protobuf.Mesh.MeshPacket,
  identifier: string
) {
  try {
    const nodeInfo = Protobuf.Mesh.User.fromBinary(dataMessage.payload);

    // Update the cache
    const deviceEntry = getDeviceCacheEntry(identifier);
    deviceEntry.lastNodeInfo = nodeInfo;

    // Insert the NodeInfo data into the database
    insertNodeInfo(identifier, nodeInfo);

    logger.debug('NODEINFO_APP', {
      id: packet.id,
      from: identifier,
      to: packet.to.toString(16),
      data: nodeInfo.toJSON(),
    });
  } catch (error) {
    logger.warn('Failed to parse NodeInfo message:', error);
  }
}
