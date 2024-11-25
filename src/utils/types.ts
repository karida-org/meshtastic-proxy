import { Protobuf } from '@meshtastic/js';

export interface DeviceCacheEntry {
  batteryLevel?: number;
  lastPosition?: Protobuf.Mesh.Position;
  lastDeviceMetrics?: Protobuf.Telemetry.DeviceMetrics;
  lastEnvironmentMetrics?: Protobuf.Telemetry.EnvironmentMetrics;
  lastPowerMetrics?: Protobuf.Telemetry.PowerMetrics;
  lastWaypoint?: Protobuf.Mesh.Waypoint;
  lastNeighborInfo?: Protobuf.Mesh.NeighborInfo;
  lastTraceRoute?: Protobuf.Mesh.RouteDiscovery;
  lastMapReport?: Protobuf.Mesh.MapReport;
  lastNodeInfo?: Protobuf.Mesh.User;
  lastUpdateTime?: number;
}

// Portnums that are handled by this application
export enum PortNum {
  TEXT_MESSAGE_APP = 1,
  POSITION_APP = 3,
  NODEINFO_APP = 4,
  WAYPOINT_APP = 8,
  TELEMETRY_APP = 67,
  TRACEROUTE_APP = 70,
  NEIGHBORINFO_APP= 71,
  MAP_REPORT_APP = 73,
  // Add other port numbers as needed
}
