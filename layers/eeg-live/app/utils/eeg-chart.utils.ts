const EMPTY_BASELINE = [0, 0] as const;

export const toLineChartValues = (samples?: number[]): number[] => {
  if (!samples || samples.length === 0) {
    return [...EMPTY_BASELINE];
  }
  return [...samples];
};
