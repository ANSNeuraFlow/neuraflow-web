export type RcCarBridgeCommand =
  | 'set_controls'
  | 'throttle_step'
  | 'steer_step'
  | 'neutral'
  | 'brake'
  | 'cycle_lights'
  | 'run_movement'
  | 'cancel_movement';

export interface RcCarMovement {
  id: string;
  label: string;
}

export interface RcCarBridgeStatus {
  serialConnected: boolean;
  throttleLevel: number;
  steerLevel: number;
  lightsMode: string;
  protocol: number;
  firmware: string;
  gamepadConnected: boolean;
  activeMovement: string;
  movementRunning: boolean;
  timestamp: number;
}

export interface RcCarCommandAck {
  command: string;
  success: boolean;
  error?: string;
  timestamp: number;
}

export type RcCarBridgeMessage =
  | { type: 'hello'; movements: RcCarMovement[]; timestamp: number }
  | ({ type: 'status' } & RcCarBridgeStatus)
  | { type: 'movements'; movements: RcCarMovement[]; timestamp: number }
  | ({ type: 'command_ack' } & RcCarCommandAck);

export const RC_CAR_STATE_KEYS = {
  connected: 'rc-car-bridge-connected',
  error: 'rc-car-bridge-error',
  status: 'rc-car-bridge-status',
  movements: 'rc-car-bridge-movements',
} as const;

function parseMovements(raw: unknown): RcCarMovement[] {
  if (!Array.isArray(raw)) return [];
  const out: RcCarMovement[] = [];
  for (const item of raw) {
    if (
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>)['id'] === 'string' &&
      typeof (item as Record<string, unknown>)['label'] === 'string'
    ) {
      out.push({
        id: (item as Record<string, unknown>)['id'] as string,
        label: (item as Record<string, unknown>)['label'] as string,
      });
    }
  }
  return out;
}

export function parseRcCarMessage(raw: string): RcCarBridgeMessage | null {
  try {
    const msg = JSON.parse(raw) as Record<string, unknown>;
    const type = msg['type'];
    const timestamp = typeof msg['timestamp'] === 'number' ? msg['timestamp'] : Date.now();

    if (type === 'hello') {
      return { type: 'hello', movements: parseMovements(msg['movements']), timestamp };
    }

    if (type === 'movements') {
      return { type: 'movements', movements: parseMovements(msg['movements']), timestamp };
    }

    if (type === 'status') {
      return {
        type: 'status',
        serialConnected: Boolean(msg['serialConnected']),
        throttleLevel: typeof msg['throttleLevel'] === 'number' ? msg['throttleLevel'] : 0,
        steerLevel: typeof msg['steerLevel'] === 'number' ? msg['steerLevel'] : 0,
        lightsMode: typeof msg['lightsMode'] === 'string' ? msg['lightsMode'] : 'steady',
        protocol: typeof msg['protocol'] === 'number' ? msg['protocol'] : 0,
        firmware: typeof msg['firmware'] === 'string' ? msg['firmware'] : '—',
        gamepadConnected: Boolean(msg['gamepadConnected']),
        activeMovement: typeof msg['activeMovement'] === 'string' ? msg['activeMovement'] : '',
        movementRunning: Boolean(msg['movementRunning']),
        timestamp,
      };
    }

    if (type === 'command_ack') {
      return {
        type: 'command_ack',
        command: typeof msg['command'] === 'string' ? msg['command'] : '',
        success: Boolean(msg['success']),
        error: typeof msg['error'] === 'string' ? msg['error'] : undefined,
        timestamp,
      };
    }

    return null;
  } catch {
    return null;
  }
}
