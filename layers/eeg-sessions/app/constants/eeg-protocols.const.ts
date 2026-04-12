export const EEG_PROTOCOL_IDS = [
  'move_left',
  'move_right',
  'move_forward',
  'move_backward',
  'move_up',
  'move_down',
] as const;

export type EegProtocolId = (typeof EEG_PROTOCOL_IDS)[number];
