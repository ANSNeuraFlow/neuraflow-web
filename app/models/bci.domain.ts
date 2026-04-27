export type BciAction = 'LEFT_HAND' | 'RIGHT_HAND' | 'UP_ACTION' | 'DOWN_ACTION';

export interface BciCommandPayload {
  command: BciAction;
  confidence: number;
  timestamp: number;
}

export type BciCommandHandler = (confidence: number) => void;

export const BCI_STATE_KEYS = {
  command: 'bci-current-command',
  confidence: 'bci-current-confidence',
  connected: 'bci-bridge-connected',
  error: 'bci-bridge-error',
} as const;

export const BCI_COMMAND_HOLD_MS = 500;

const BCI_ACTIONS = new Set<string>(['LEFT_HAND', 'RIGHT_HAND', 'UP_ACTION', 'DOWN_ACTION']);

export function parseBciMessage(raw: string): BciCommandPayload | null {
  try {
    const msg = JSON.parse(raw) as Record<string, unknown>;
    if (
      msg['type'] !== 'BCI_COMMAND' ||
      typeof msg['command'] !== 'string' ||
      !BCI_ACTIONS.has(msg['command']) ||
      typeof msg['confidence'] !== 'number' ||
      typeof msg['timestamp'] !== 'number'
    ) {
      return null;
    }
    return {
      command: msg['command'] as BciAction,
      confidence: msg['confidence'],
      timestamp: msg['timestamp'],
    };
  } catch {
    return null;
  }
}
