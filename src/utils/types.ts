import { Protobuf } from '@meshtastic/js';

export interface DeviceCacheEntry {
  batteryLevel?: number;
  lastPosition?: Protobuf.Mesh.Position;
  lastDeviceMetrics?: Protobuf.Telemetry.DeviceMetrics;
  lastEnvironmentMetrics?: Protobuf.Telemetry.EnvironmentMetrics;
  lastNodeInfo?: Protobuf.Mesh.User;
  lastUpdateTime?: number;
}

export enum PortNum {
  TEXT_MESSAGE_APP = 1,
  POSITION_APP = 3,
  NODEINFO_APP = 4,
  TELEMETRY_APP = 67,
  // Add other port numbers as needed
}
