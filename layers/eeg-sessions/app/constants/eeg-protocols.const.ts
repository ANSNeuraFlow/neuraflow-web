export const EEG_PROTOCOL_IDS = [
  'move_left',
  'move_right',
  'move_forward',
  'move_backward',
  'move_up',
  'move_down',
  'attention',
] as const;

export type EegProtocolId = (typeof EEG_PROTOCOL_IDS)[number];

export const EEG_SESSION_TYPE_PROTOCOLS = {
  motor_imagery: ['move_left', 'move_right', 'move_forward', 'move_backward', 'move_up', 'move_down'],
  attention: ['attention'],
} as const satisfies Record<string, readonly EegProtocolId[]>;

export type EegSessionTrainingPickerType = keyof typeof EEG_SESSION_TYPE_PROTOCOLS;

export type EegProtocolKindUiKey = 'movement' | 'focus' | 'unknown';

const MOTOR_PROTOCOL_SET = new Set<string>(EEG_SESSION_TYPE_PROTOCOLS.motor_imagery);

export function resolveEegProtocolKindUi(protocolName: string): EegProtocolKindUiKey {
  if (MOTOR_PROTOCOL_SET.has(protocolName)) {
    return 'movement';
  }
  if (protocolName === 'attention') {
    return 'focus';
  }
  return 'unknown';
}
