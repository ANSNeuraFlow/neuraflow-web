export type DroneCommand =
  | 'arm'
  | 'disarm'
  | 'takeoff'
  | 'land'
  | 'move_forward'
  | 'move_backward'
  | 'move_left'
  | 'move_right';

export type DroneDirection = 'forward' | 'backward' | 'left' | 'right';

export interface DroneCommandEntry {
  id: string;
  command: DroneCommand;
  timestamp: Date;
}

export interface DroneTelemetryData {
  batteryVoltage: number | null;
  batteryPercent: number | null;
  altitude: number | null;
  speed: number | null;
  pitch: number | null;
  roll: number | null;
  heading: number | null;
  signalStrength: number | null;
  gpsLat: number | null;
  gpsLon: number | null;
  distanceFromHome: number | null;
  connected: boolean;
}
