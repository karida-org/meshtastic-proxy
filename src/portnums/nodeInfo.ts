import { Protobuf } from '@meshtastic/js';
import logger from '../utils/logger.js';
import { getDeviceCacheEntry } from '../utils/cache.js';
import { connection as dbcon } from '../database.js';
import { upsertDeviceEntity } from '../handlers/fiwareClient.js';

/**
 * Initializes the NodeInfo database table
 */
export function initNodeInfoDatabase() {
  dbcon.run(
    `
    CREATE TABLE IF NOT EXISTS NodeInfo (
      id TEXT PRIMARY KEY,
      data JSON,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE OR REPLACE VIEW NodeInfoView AS
    SELECT
      id,
      data->>'longName' AS longName,
      data->>'shortName' AS shortName,
      data->>'hwModel' AS hwModel,
      data->>'role' AS role,
      created_at,
      updated_at
    FROM NodeInfo;
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

/**
 * Inserts NodeInfo data into the database
 * @param identifier
 * @param data
 */
function insertNodeInfo(identifier: string, data: Protobuf.Mesh.User) {
  dbcon.run(
    `
    INSERT INTO NodeInfo (id, data)
    VALUES (?::TEXT, ?::JSON)
    ON CONFLICT(id) DO UPDATE SET
      data = excluded.data::JSON,
      updated_at = NOW()
    `,
    identifier, JSON.stringify(data.toJSON()),
    (err) => {
      if (err) {
        logger.error('Failed to insert NodeInfo data:', err);
      } else {
        logger.debug('NodeInfo data inserted successfully');
      }
    }
  );

  if (logger.level === 'debug') {
    dbcon.all(`SELECT * FROM NodeInfoView`,
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

    // Create or update entity on FIWARE Context Broker
    const {longName, shortName, macaddr, hwModel, isLicensed, role, publicKey} = nodeInfo.toJSON();
    upsertDeviceEntity(identifier, 'Device', {longName, shortName, hwModel, role});

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
