import { useNuxtApp } from 'nuxt/app';
import { ref } from 'vue';

import { SSVEP_DEFAULT_CHANNELS, SSVEP_DEFAULT_FREQUENCIES, SSVEP_FREQUENCY_TO_ACTION } from '../constants/ssvep.const';

export function useSsvepBridge() {
  const nuxtApp = useNuxtApp();
  const isDetecting = ref(false);

  const sendConfig = (opts: {
    frequencies?: number[];
    refreshRate?: number;
    userId?: string;
    threshold?: number;
    window?: number;
  }) => {
    const freqs = opts.frequencies ?? [...SSVEP_DEFAULT_FREQUENCIES];
    const actions = ['up', 'down', 'left', 'right'].map(
      (d) => SSVEP_FREQUENCY_TO_ACTION[d as keyof typeof SSVEP_FREQUENCY_TO_ACTION],
    );
    return nuxtApp.$bciBridge?.sendJson?.({
      type: 'SSVEP_CONFIG',
      frequencies: freqs,
      actions,
      channels: [...SSVEP_DEFAULT_CHANNELS],
      window: opts.window ?? 1.5,
      threshold: opts.threshold ?? 0.35,
      userId: opts.userId ?? 'default',
      refreshRate: opts.refreshRate ?? 60,
    });
  };

  const startDetection = () => {
    const ok = nuxtApp.$bciBridge?.sendJson?.({ type: 'SSVEP_DETECT_START' });
    if (ok) isDetecting.value = true;
    return ok;
  };

  const stopDetection = () => {
    const ok = nuxtApp.$bciBridge?.sendJson?.({ type: 'SSVEP_DETECT_STOP' });
    isDetecting.value = false;
    return ok;
  };

  const calibrateStart = (frequency: number, userId = 'default') =>
    nuxtApp.$bciBridge?.sendJson?.({
      type: 'SSVEP_CALIBRATE_START',
      frequency,
      channels: [...SSVEP_DEFAULT_CHANNELS],
      userId,
    });

  const calibrateEpoch = () => nuxtApp.$bciBridge?.sendJson?.({ type: 'SSVEP_CALIBRATE_EPOCH' });

  const calibrateFinish = () => nuxtApp.$bciBridge?.sendJson?.({ type: 'SSVEP_CALIBRATE_FINISH' });

  return {
    isDetecting,
    sendConfig,
    startDetection,
    stopDetection,
    calibrateStart,
    calibrateEpoch,
    calibrateFinish,
  };
}
