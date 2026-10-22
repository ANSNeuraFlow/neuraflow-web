import { useWakeLock } from '@vueuse/core';
import { useNuxtApp } from 'nuxt/app';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import { useBciController } from '~/composables/useBciController';

import { exactWait, playTone } from './eeg-protocol.utils';

// ------------- Sprawdzenie skuteczności modelu (scenariusz lewo/prawo) --------
// Operator układa kolejność strzałek. Predykcje przychodzą z modelu
// załadowanego w NeuraFlow Local Bridge. Werdykt próby to predykcja
// LEFT_HAND / RIGHT_HAND o najwyższej pewności w oknie wykonania.

const EVAL_TIMING = {
  relaxation: 2000,
  cue: 1250,
  execution: 2750,
  rest: 2000,
  itiMin: 500,
  itiMax: 1500,
} as const;

export type EvalCue = 'LEFT' | 'RIGHT';

export type EvalPhase = 'setup' | 'running' | 'summary';

export type EvalProtocolState = 'idle' | 'relaxation' | 'cue' | 'execution' | 'rest' | 'iti';

export interface EvalStep {
  id: string;
  cue: EvalCue;
}

export interface EvalTrialResult {
  index: number;
  expected: EvalCue;
  detected: EvalCue | null;
  confidence: number | null;
}

const cueFromCommand = (command: string): EvalCue | null => {
  if (command === 'LEFT_HAND') return 'LEFT';
  if (command === 'RIGHT_HAND') return 'RIGHT';
  return null;
};

export const useModelEval = () => {
  const nuxtApp = useNuxtApp();
  const { isConnected, reconnect } = useBciController();
  const { isSupported: wakeLockSupported, request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  const steps = ref<EvalStep[]>([]);
  const phase = ref<EvalPhase>('setup');
  const currentState = ref<EvalProtocolState>('idle');
  const currentTrial = ref(0);
  const totalTrials = ref(0);
  const activeCue = ref<EvalCue | ''>('');
  const results = ref<EvalTrialResult[]>([]);
  const errorKey = ref<string | null>(null);
  const containerRef = ref<HTMLElement | null>(null);
  const abortController = ref<AbortController | null>(null);

  let stepSeq = 0;
  let expectFullscreenExit = false;

  const wrongResults = computed(() => results.value.filter((trial) => trial.detected !== trial.expected));
  const hitCount = computed(() => results.value.length - wrongResults.value.length);

  const addStep = (cue: EvalCue) => {
    if (phase.value !== 'setup') return;
    stepSeq += 1;
    steps.value.push({ id: `step-${stepSeq}`, cue });
  };

  const removeStep = (id: string) => {
    if (phase.value !== 'setup') return;
    steps.value = steps.value.filter((step) => step.id !== id);
  };

  const scoreExecution = async (signal: AbortSignal) => {
    const best: { cue: EvalCue | null; confidence: number | null } = { cue: null, confidence: null };
    const off = nuxtApp.$bciBridge?.subscribePayload((payload) => {
      const cue = cueFromCommand(payload.command);
      if (!cue) return;
      if (best.confidence === null || payload.confidence > best.confidence) {
        best.cue = cue;
        best.confidence = payload.confidence;
      }
    });

    try {
      await exactWait(EVAL_TIMING.execution, signal);
    } finally {
      off?.();
    }

    return best;
  };

  const enterFullscreen = async () => {
    const el = containerRef.value;
    if (el && !document.fullscreenElement) {
      await el.requestFullscreen().catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Fullscreen request failed: ${msg}`);
      });
    }
    if (wakeLockSupported.value) {
      await requestWakeLock('screen').catch((err: unknown) => {
        console.warn('Wake lock request failed:', err instanceof Error ? err.message : String(err));
      });
    }
  };

  const leaveFullscreen = () => {
    void releaseWakeLock();
    if (document.fullscreenElement) {
      expectFullscreenExit = true;
      void document.exitFullscreen();
    }
  };

  const resetRunView = () => {
    currentState.value = 'idle';
    currentTrial.value = 0;
    activeCue.value = '';
  };

  const start = async () => {
    errorKey.value = null;
    if (steps.value.length === 0) {
      errorKey.value = 'machineLearning.modelEval.errors.empty';
      return;
    }
    if (!isConnected.value || !nuxtApp.$bciBridge) {
      errorKey.value = 'machineLearning.modelEval.errors.bridgeOffline';
      return;
    }

    abortController.value = new AbortController();
    const signal = abortController.value.signal;
    const sequence = steps.value.map((step) => step.cue);

    results.value = [];
    totalTrials.value = sequence.length;

    let completed = false;

    try {
      phase.value = 'running';
      currentState.value = 'iti';
      currentTrial.value = 0;
      await nextTick();
      await enterFullscreen();
      await exactWait(2000, signal);

      for (let i = 0; i < sequence.length; i++) {
        const expected = sequence[i]!;
        currentTrial.value = i + 1;
        activeCue.value = expected;

        currentState.value = 'relaxation';
        await exactWait(EVAL_TIMING.relaxation, signal);

        currentState.value = 'cue';
        playTone(800, 0.15);
        await exactWait(EVAL_TIMING.cue, signal);

        currentState.value = 'execution';
        const best = await scoreExecution(signal);
        results.value.push({
          index: i + 1,
          expected,
          detected: best.cue,
          confidence: best.confidence,
        });

        currentState.value = 'rest';
        await exactWait(EVAL_TIMING.rest, signal);

        currentState.value = 'iti';
        await exactWait(EVAL_TIMING.itiMin + Math.random() * (EVAL_TIMING.itiMax - EVAL_TIMING.itiMin), signal);
      }

      completed = true;
    } catch (err: unknown) {
      if (!(err instanceof Error && err.message === 'Aborted')) {
        console.error(err);
        errorKey.value = 'machineLearning.modelEval.errors.runFailed';
      }
    } finally {
      leaveFullscreen();
      resetRunView();
      phase.value = completed ? 'summary' : 'setup';
      abortController.value = null;
    }
  };

  const abort = () => {
    abortController.value?.abort();
    leaveFullscreen();
  };

  const backToEditor = () => {
    results.value = [];
    errorKey.value = null;
    phase.value = 'setup';
  };

  const handleFullscreenChange = () => {
    const nowFullscreen = !!document.fullscreenElement;
    if (expectFullscreenExit) {
      expectFullscreenExit = false;
      return;
    }
    if (!nowFullscreen && phase.value === 'running' && currentState.value !== 'idle') {
      abort();
    }
  };

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    if (phase.value === 'running') abort();
  });

  return {
    steps,
    addStep,
    removeStep,
    phase,
    currentState,
    currentTrial,
    totalTrials,
    activeCue,
    results,
    wrongResults,
    hitCount,
    errorKey,
    containerRef,
    isConnected,
    reconnect,
    start,
    abort,
    backToEditor,
  };
};
