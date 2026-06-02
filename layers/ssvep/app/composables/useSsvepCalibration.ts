import { useWakeLock } from '@vueuse/core';
import { computed, onBeforeUnmount, ref } from 'vue';

import { exactWait } from '#layers/machine-learning/app/composables/eeg-protocol.utils';

import {
  SSVEP_CALIB_TRIALS_PER_DIRECTION,
  SSVEP_CALIBRATION_TIMING,
  SSVEP_DEFAULT_FREQUENCIES,
} from '../constants/ssvep.const';
import { buildFrequencySetForRefreshRate } from '../utils/refresh-rate.utils';
import { useSsvepBridge } from './useSsvepBridge';
import { useSsvepSession } from './useSsvepSession';

export type SsvepCalibPhase = 'setup' | 'intro' | 'baseline' | 'cue' | 'stimulation' | 'iti' | 'done';

const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;

export function useSsvepCalibration() {
  const bridge = useSsvepBridge();
  const session = useSsvepSession();
  const refreshRate = ref(60);
  const phase = ref<SsvepCalibPhase>('setup');
  const currentTrial = ref(0);
  const totalTrials = ref(SSVEP_CALIB_TRIALS_PER_DIRECTION * DIRECTIONS.length);
  const activeDirection = ref<(typeof DIRECTIONS)[number]>('up');
  const activeFrequency = ref(9);
  const containerRef = ref<HTMLElement | null>(null);
  const isFullscreen = ref(false);
  const abortController = ref<AbortController | null>(null);

  const { isSupported: wakeLockSupported, request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  const frequencySet = computed(() => buildFrequencySetForRefreshRate(refreshRate.value));

  const buildTrialSequence = (): Array<{ direction: (typeof DIRECTIONS)[number]; frequency: number }> => {
    const seq: Array<{ direction: (typeof DIRECTIONS)[number]; frequency: number }> = [];
    const freqs = [...SSVEP_DEFAULT_FREQUENCIES];
    for (let t = 0; t < SSVEP_CALIB_TRIALS_PER_DIRECTION; t++) {
      for (let i = 0; i < DIRECTIONS.length; i++) {
        seq.push({ direction: DIRECTIONS[i]!, frequency: freqs[i]! });
      }
    }
    for (let i = seq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [seq[i], seq[j]] = [seq[j]!, seq[i]!];
    }
    return seq;
  };

  let trialSequence: ReturnType<typeof buildTrialSequence> = [];

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.value) {
      await containerRef.value.requestFullscreen().catch(() => undefined);
      isFullscreen.value = true;
      if (wakeLockSupported.value) await requestWakeLock('screen').catch(() => undefined);
    } else if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      isFullscreen.value = false;
      await releaseWakeLock();
    }
  };

  const abort = () => {
    abortController.value?.abort();
    bridge.stopDetection();
    phase.value = 'done';
  };

  const runCalibration = async () => {
    abortController.value = new AbortController();
    const signal = abortController.value.signal;
    trialSequence = buildTrialSequence();
    totalTrials.value = trialSequence.length;
    currentTrial.value = 0;

    bridge.sendConfig({ frequencies: [...SSVEP_DEFAULT_FREQUENCIES], refreshRate: refreshRate.value });
    bridge.startDetection();

    try {
      await session.startRecording('ssvep_calibration', `SSVEP cal ${Date.now()}`);
    } catch {
      /* optional cloud recording */
    }

    phase.value = 'intro';
    await exactWait(3000, signal);
    if (signal.aborted) return;

    for (let i = 0; i < trialSequence.length; i++) {
      if (signal.aborted) break;
      const trial = trialSequence[i]!;
      currentTrial.value = i + 1;
      activeDirection.value = trial.direction;
      activeFrequency.value = trial.frequency;

      phase.value = 'baseline';
      await exactWait(SSVEP_CALIBRATION_TIMING.baseline, signal);

      phase.value = 'cue';
      await exactWait(SSVEP_CALIBRATION_TIMING.cue, signal);

      bridge.calibrateStart(trial.frequency);
      await session.emitFrequencyMarker(trial.frequency, i);

      phase.value = 'stimulation';
      await exactWait(SSVEP_CALIBRATION_TIMING.stimulation, signal);
      bridge.calibrateEpoch();

      phase.value = 'iti';
      const iti =
        SSVEP_CALIBRATION_TIMING.itiMin +
        Math.random() * (SSVEP_CALIBRATION_TIMING.itiMax - SSVEP_CALIBRATION_TIMING.itiMin);
      await exactWait(iti, signal);
    }

    bridge.calibrateFinish();
    bridge.stopDetection();
    await session.endRecording();
    phase.value = 'done';
  };

  onBeforeUnmount(() => {
    abortController.value?.abort();
    releaseWakeLock();
  });

  return {
    refreshRate,
    phase,
    currentTrial,
    totalTrials,
    activeDirection,
    activeFrequency,
    frequencySet,
    containerRef,
    isFullscreen,
    toggleFullscreen,
    runCalibration,
    abort,
  };
}
