export type MetricColor = 'default' | 'success' | 'warning' | 'error';

export const METRIC_THRESHOLDS = {
  critical: 80,
  warning: 50,
} as const;

export const toGb = (bytes: number | null): string => {
  if (bytes === null) return '—';
  return (bytes / 1_073_741_824).toFixed(1);
};

export const toPercent = (val: number | null): string => {
  if (val === null) return '—';
  return `${val.toFixed(1)}%`;
};

export const getMetricColor = (pct: number | null): MetricColor => {
  if (pct === null) return 'default';
  if (pct >= METRIC_THRESHOLDS.critical) return 'error';
  if (pct >= METRIC_THRESHOLDS.warning) return 'warning';
  return 'success';
};

export const getMetricTextClass = (pct: number | null): string => {
  if (pct === null) return 'text-on-surface-dim';
  if (pct >= METRIC_THRESHOLDS.critical) return 'text-error';
  if (pct >= METRIC_THRESHOLDS.warning) return 'text-warning';
  return 'text-success';
};
