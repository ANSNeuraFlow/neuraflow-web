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
  ackSuccess?: boolean;
  ackResult?: string;
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

export interface DroneBridgeStatus {
  connected: boolean;
  armed: boolean;
  flightMode: string;
  airborne?: boolean;
}

export interface DroneCommandAck {
  command: DroneCommand | string;
  success: boolean;
  result: string;
}

export interface TakeoffParams {
  altitude?: number;
}

export type DroneCommandParams = TakeoffParams | Record<string, unknown>;
