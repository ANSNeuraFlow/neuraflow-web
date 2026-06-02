import { onUnmounted, ref } from 'vue';

import { buildFrequencySetForRefreshRate } from '../utils/refresh-rate.utils';

export type SsvepStimuliPhase = 'idle' | 'cueing' | 'active' | 'feedback';

export function useSsvepStimuli(refreshRate: () => number) {
  const phase = ref<SsvepStimuliPhase>('active');
  const cuedDirection = ref<'up' | 'down' | 'left' | 'right' | null>(null);
  const startTime = ref(performance.now());
  const measuredFps = ref(0);

  const rafId = 0;
  let frameCount = 0;
  let lastFpsTick = performance.now();

  const targets = () => buildFrequencySetForRefreshRate(refreshRate());

  const luminanceAt = (frequency: number, tSec: number): number => {
    return 0.5 * (1 + Math.sin(2 * Math.PI * frequency * tSec));
  };

  const tickFps = () => {
    frameCount++;
    const now = performance.now();
    if (now - lastFpsTick >= 1000) {
      measuredFps.value = Math.round((frameCount * 1000) / (now - lastFpsTick));
      frameCount = 0;
      lastFpsTick = now;
    }
  };

  const resetClock = () => {
    startTime.value = performance.now();
  };

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId);
  });

  return {
    phase,
    cuedDirection,
    startTime,
    measuredFps,
    targets,
    luminanceAt,
    tickFps,
    resetClock,
  };
}
