export const SSVEP_REFRESH_RATES = [60, 75, 90, 100, 120, 144, 165, 180, 240, 360] as const;

export type SsvepRefreshRate = (typeof SSVEP_REFRESH_RATES)[number];

export const SSVEP_STORAGE_KEYS = {
  refreshRate: 'ssvep-refresh-rate',
} as const;

/** Default non-harmonic frequency set (Hz): UP, DOWN, LEFT, RIGHT */
export const SSVEP_DEFAULT_FREQUENCIES = [9, 11, 13, 15] as const;

export const SSVEP_DIRECTIONS = ['up', 'down', 'left', 'right'] as const;

export type SsvepDirection = (typeof SSVEP_DIRECTIONS)[number];

export const SSVEP_FREQUENCY_TO_ACTION = {
  up: 'UP_ACTION',
  down: 'DOWN_ACTION',
  left: 'LEFT_HAND',
  right: 'RIGHT_HAND',
} as const;

export const SSVEP_FREQUENCY_TO_MARKER: Record<number, string> = {
  9: 'SSVEP_9HZ',
  11: 'SSVEP_11HZ',
  13: 'SSVEP_13HZ',
  15: 'SSVEP_15HZ',
};

export const SSVEP_DEFAULT_CHANNELS = [6, 7] as const;

export const SSVEP_CALIBRATION_TIMING = {
  baseline: 1000,
  cue: 1000,
  stimulation: 3500,
  itiMin: 800,
  itiMax: 1200,
} as const;

export const SSVEP_CALIB_TRIALS_PER_DIRECTION = 12;
