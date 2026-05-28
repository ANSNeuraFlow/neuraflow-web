import type { DroneCommand, DroneTelemetryData } from './drone-control.domain';

export type MavlinkBridgeMessageType = 'telemetry' | 'status' | 'command_ack' | 'hello';

export interface MavlinkTelemetryMessage {
  type: 'telemetry';
  group: string;
  data: Partial<DroneTelemetryData>;
  timestamp: number;
}

export interface MavlinkStatusMessage {
  type: 'status';
  connected: boolean;
  armed: boolean;
  flightMode: string;
  airborne?: boolean;
  timestamp?: number;
}

export interface MavlinkCommandAckMessage {
  type: 'command_ack';
  command: DroneCommand | string;
  success: boolean;
  result: string;
  timestamp?: number;
}

export type MavlinkBridgeInboundMessage =
  | MavlinkTelemetryMessage
  | MavlinkStatusMessage
  | MavlinkCommandAckMessage
  | { type: 'hello'; timestamp?: number };

export function parseMavlinkBridgeMessage(raw: string): MavlinkBridgeInboundMessage | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const type = data.type;
    if (type === 'telemetry' || type === 'status' || type === 'command_ack' || type === 'hello') {
      return data as MavlinkBridgeInboundMessage;
    }
    return null;
  } catch {
    return null;
  }
}
