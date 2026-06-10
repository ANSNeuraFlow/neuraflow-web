export const CAR_BCI_PREDICTION_INTERVAL_MS = 2500;
export const CAR_BCI_PULSE_DURATION_MS = 1250;
export const CAR_BCI_STEER_HOLD_MS = 1250;

export type CarBciDriveMode = 'instant' | 'consensus';
export type CarBciSteerVote = 'left' | 'right';
export type CarBciConsensusPhase = 'collecting' | 'tiebreak';

export const CAR_BCI_STATE_KEYS = {
  consensusVotes: 'car-bci-consensus-votes',
  consensusPhase: 'car-bci-consensus-phase',
} as const;
