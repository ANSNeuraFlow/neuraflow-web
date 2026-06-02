import { SSVEP_DEFAULT_FREQUENCIES } from '../constants/ssvep.const';

export interface FrequencySetEntry {
  frequency: number;
  direction: 'up' | 'down' | 'left' | 'right';
  quality: 'optimal' | 'good' | 'warning';
  samplesPerCycle: number;
}

const DIRECTIONS: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];

function isNonHarmonicSet(freqs: number[]): boolean {
  for (let i = 0; i < freqs.length; i++) {
    for (let j = i + 1; j < freqs.length; j++) {
      const a = freqs[i]!;
      const b = freqs[j]!;
      if (a > b) {
        if (Math.abs(a / b - Math.round(a / b)) < 0.02) return false;
      } else if (Math.abs(b / a - Math.round(b / a)) < 0.02) return false;
    }
  }
  return true;
}

function scoreFrequency(freq: number, refreshRate: number): FrequencySetEntry['quality'] {
  const nyquist = refreshRate / 2;
  if (freq >= nyquist * 0.95) return 'warning';
  const spc = refreshRate / freq;
  if (spc < 3) return 'warning';
  const aliasDist = Math.min(
    Math.abs(freq - refreshRate),
    Math.abs(freq - refreshRate / 2),
    Math.abs(2 * freq - refreshRate),
  );
  if (aliasDist < 1.5) return 'warning';
  if (spc >= 5) return 'optimal';
  return 'good';
}

export function getDefaultFrequencySet(): number[] {
  return [...SSVEP_DEFAULT_FREQUENCIES];
}

export function buildFrequencySetForRefreshRate(refreshRate: number): FrequencySetEntry[] {
  const freqs = getDefaultFrequencySet();
  if (!isNonHarmonicSet(freqs)) {
    return freqs.map((frequency, i) => ({
      frequency,
      direction: DIRECTIONS[i]!,
      quality: scoreFrequency(frequency, refreshRate),
      samplesPerCycle: refreshRate / frequency,
    }));
  }
  return freqs.map((frequency, i) => ({
    frequency,
    direction: DIRECTIONS[i]!,
    quality: scoreFrequency(frequency, refreshRate),
    samplesPerCycle: refreshRate / frequency,
  }));
}

export function detectRefreshRate(): number {
  if (import.meta.client && typeof window !== 'undefined') {
    const rate = (window.screen as Screen & { refreshRate?: number }).refreshRate;
    if (typeof rate === 'number' && rate >= 30 && rate <= 500) {
      return Math.round(rate);
    }
  }
  return 60;
}

export function loadStoredRefreshRate(): number | null {
  if (!import.meta.client) return null;
  try {
    const raw = localStorage.getItem('ssvep-refresh-rate');
    if (!raw) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function saveRefreshRate(rate: number): void {
  if (!import.meta.client) return;
  try {
    localStorage.setItem('ssvep-refresh-rate', String(rate));
  } catch {
    /* ignore */
  }
}
