import { useWakeLock } from '@vueuse/core';
import { useNuxtApp } from 'nuxt/app';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import { useBridgeConnection } from '#layers/bridge-auth/app/composables/useBridgeConnection';
import { useBridgeStreamService } from '#layers/bridge-auth/app/services/bridge-stream.service';
import { useEegSessionService } from '#layers/eeg-sessions/app/services/eeg-session.service';
import { useBciController } from '~/composables/useBciController';

import type { EegIngressMode } from '../models/eeg-ingress.domain';
import {
  assertBridgeIngressReady,
  assertLocalWsReady,
  clearBoundSession,
  createBoundSession,
  makeLocalMarkerSender,
  makeNeuraflowMarkerSender,
  sendLocalLifecycleEvent,
  usesNeuraflowBackendIngress,
  usesNeuraflowBridgeStreaming,
} from './eeg-ingress.utils';
import { exactWait, generateCptDigits, generateSequence, playTone } from './eeg-protocol.utils';

const ATTENTION_TIMING = {
  cue: 2000,
  focusActive: 15_000,
  relaxActive: 12_000,
  focusActiveTutorial: 6_000,
  relaxActiveTutorial: 6_000,
  itiMin: 1000,
  itiMax: 2000,
  baseline: 120_000,
  cptDigitInterval: 1500,
} as const;

const ATTENTION_TOTAL_TRIALS = 40;
const ATTENTION_BREAK_AFTER_TRIAL = 20;

export type AttentionClass = 'FOCUS' | 'RELAX';
export type AttentionState = 'idle' | 'baseline' | 'cue' | 'active' | 'iti' | 'break' | 'summary';

const ATTENTION_TUTORIAL_SEQUENCE: AttentionClass[] = ['FOCUS', 'RELAX'];

export const useAttentionCalibration = () => {
  const bridge = useBridgeConnection();
  const nuxtApp = useNuxtApp();
  const { sendMarker } = useBridgeStreamService();
  const { stopSession } = useEegSessionService();
  const sendNeuraflowAttentionMarker = makeNeuraflowMarkerSender(sendMarker, 'Attention');
  const { isConnected: localWsConnected } = useBciController();

  const { isSupported: wakeLockSupported, request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  const activeIngressMode = ref<EegIngressMode | null>(null);
  const markerSink = ref<((m: string) => Promise<void>) | null>(null);

  const emitMarker = async (marker: string) => {
    await markerSink.value?.(marker);
  };

  const abortController = ref<AbortController | null>(null);
  const currentState = ref<AttentionState>('idle');
  const currentTrial = ref(0);
  const totalTrialsRef = ref(ATTENTION_TOTAL_TRIALS);
  const activeCue = ref<AttentionClass | ''>('');
  const isFullscreen = ref(false);
  const protocolEndReason = ref<'success' | 'abort' | 'tutorial-done' | null>(null);
  const tutorialMode = ref(false);
  const containerRef = ref<HTMLElement | null>(null);
  const soundEnabled = ref(true);
  const baselineSecondsLeft = ref(120);
  const cptDigit = ref<string | null>(null);
  const collectedTrials = ref(0);
  const sessionDurationMs = ref(0);

  let breakResolve: (() => void) | null = null;
  let expectFullscreenExit = false;

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.value) {
      await containerRef.value.requestFullscreen().catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Fullscreen request failed: ${msg}`);
      });
      isFullscreen.value = true;
      if (wakeLockSupported.value) {
        await requestWakeLock('screen').catch((e: unknown) => {
          console.warn('Wake lock request failed:', e instanceof Error ? e.message : String(e));
        });
      }
    }
  };

  const exitFullscreen = () => {
    void releaseWakeLock();
    if (document.fullscreenElement) {
      expectFullscreenExit = true;
      void document.exitFullscreen();
    }
    isFullscreen.value = false;
  };

  const handleFullscreenChange = () => {
    const nowFullscreen = !!document.fullscreenElement;
    isFullscreen.value = nowFullscreen;

    if (expectFullscreenExit) {
      expectFullscreenExit = false;
      return;
    }

    if (
      !nowFullscreen &&
      abortController.value &&
      !abortController.value.signal.aborted &&
      currentState.value !== 'idle' &&
      currentState.value !== 'break'
    ) {
      abortProtocol();
    }
  };

  const continueAfterBreak = () => {
    breakResolve?.();
    breakResolve = null;
  };

  const runBaseline = async (signal: AbortSignal) => {
    currentState.value = 'baseline';
    baselineSecondsLeft.value = 120;
    await emitMarker('BASELINE_START');
    const baselineStart = performance.now();
    for (; performance.now() - baselineStart < ATTENTION_TIMING.baseline; ) {
      await exactWait(500, signal);
      const elapsed = performance.now() - baselineStart;
      baselineSecondsLeft.value = Math.max(0, Math.ceil((ATTENTION_TIMING.baseline - elapsed) / 1000));
    }
    await emitMarker('BASELINE_END');
  };

  const runTrial = async (cue: AttentionClass, signal: AbortSignal, sendMarkers: boolean, tutorial = false) => {
    activeCue.value = cue;
    cptDigit.value = null;

    currentState.value = 'cue';
    if (sendMarkers) await emitMarker(`${cue}_CUE`);
    if (soundEnabled.value) playTone(cue === 'FOCUS' ? 880 : 440);
    await exactWait(ATTENTION_TIMING.cue, signal);

    currentState.value = 'active';
    if (sendMarkers) await emitMarker(`${cue}_START`);

    if (cue === 'FOCUS') {
      const duration = tutorial ? ATTENTION_TIMING.focusActiveTutorial : ATTENTION_TIMING.focusActive;
      const digits = generateCptDigits(Math.round(duration / ATTENTION_TIMING.cptDigitInterval));
      for (const digit of digits) {
        cptDigit.value = digit;
        await exactWait(ATTENTION_TIMING.cptDigitInterval, signal);
      }
    } else {
      const duration = tutorial ? ATTENTION_TIMING.relaxActiveTutorial : ATTENTION_TIMING.relaxActive;
      const deadline = performance.now() + duration;
      for (; performance.now() < deadline; ) {
        await exactWait(100, signal);
      }
    }

    if (sendMarkers) await emitMarker(`${cue}_END`);

    currentState.value = 'iti';
    await exactWait(
      ATTENTION_TIMING.itiMin + Math.random() * (ATTENTION_TIMING.itiMax - ATTENTION_TIMING.itiMin),
      signal,
    );
  };

  const runProtocol = async (
    sessionName = 'Attention Calibration',
    ingressMode: EegIngressMode = 'neuraflow-bridge',
  ) => {
    tutorialMode.value = false;
    activeIngressMode.value = ingressMode;

    try {
      if (usesNeuraflowBridgeStreaming(ingressMode)) {
        await assertBridgeIngressReady(bridge);
      } else if (ingressMode === 'local-bridge') {
        assertLocalWsReady(localWsConnected);
      }
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      console.error(`Attention prerequisites not met (${code}).`);
      activeIngressMode.value = null;
      return;
    }

    let sessionId: string;
    try {
      sessionId = await createBoundSession(sessionName, 'attention', bridge, ingressMode);
    } catch (e) {
      console.error('Cannot start attention calibration without server session and Kafka bridge binding:', e);
      bridge.error.value = e instanceof Error ? e.message : 'EEG session or bridge binding failed.';
      activeIngressMode.value = null;
      return;
    }

    markerSink.value = usesNeuraflowBackendIngress(ingressMode)
      ? sendNeuraflowAttentionMarker
      : makeLocalMarkerSender(nuxtApp);

    await toggleFullscreen();

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    currentTrial.value = 0;
    totalTrialsRef.value = ATTENTION_TOTAL_TRIALS;
    collectedTrials.value = 0;
    const sessionStart = Date.now();

    if (usesNeuraflowBackendIngress(ingressMode)) {
      await emitMarker('SESSION_START');
    } else {
      sendLocalLifecycleEvent(nuxtApp, 'SESSION_START', sessionId, '');
    }

    const sequence = generateSequence(['FOCUS', 'RELAX'], ATTENTION_TOTAL_TRIALS) as AttentionClass[];
    let completedSuccessfully = false;

    try {
      await runBaseline(signal);
      currentState.value = 'iti';
      await exactWait(2000, signal);

      for (let i = 0; i < sequence.length; i++) {
        currentTrial.value = i + 1;

        if (i === ATTENTION_BREAK_AFTER_TRIAL) {
          exitFullscreen();
          currentState.value = 'break';
          await emitMarker('BREAK_START');
          await new Promise<void>((resolve, reject) => {
            breakResolve = resolve;
            signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
          });
          await emitMarker('BREAK_END');
          await toggleFullscreen();
        }

        await runTrial(sequence[i]!, signal, true);
        collectedTrials.value = i + 1;
      }

      await emitMarker('SESSION_END');
      await stopSession(sessionId);
      completedSuccessfully = true;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Aborted') {
        console.log('Attention protocol manually aborted.');
      } else {
        console.error(err);
      }
      await emitMarker('SESSION_ABORTED');
      await stopSession(sessionId).catch(() => {});
      currentTrial.value = 0;
      activeCue.value = '';
      currentState.value = 'idle';
      protocolEndReason.value = 'abort';
    } finally {
      if (usesNeuraflowBridgeStreaming(ingressMode)) {
        await bridge.stopStreaming({ waitForDeviceStopped: false }).catch(() => {});
      }
      await clearBoundSession(bridge, ingressMode);
      markerSink.value = null;
      activeIngressMode.value = null;
      exitFullscreen();
      breakResolve = null;
    }

    if (completedSuccessfully) {
      sessionDurationMs.value = Date.now() - sessionStart;
      currentState.value = 'summary';
    }
  };

  const runTutorial = async () => {
    tutorialMode.value = true;
    totalTrialsRef.value = ATTENTION_TUTORIAL_SEQUENCE.length;

    await toggleFullscreen();

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    currentTrial.value = 0;
    currentState.value = 'iti';
    let completedSuccessfully = false;

    try {
      await exactWait(1000, signal);
      for (let i = 0; i < ATTENTION_TUTORIAL_SEQUENCE.length; i++) {
        currentTrial.value = i + 1;
        await runTrial(ATTENTION_TUTORIAL_SEQUENCE[i]!, signal, false, true);
      }
      completedSuccessfully = true;
    } catch (err: unknown) {
      if (!(err instanceof Error && err.message === 'Aborted')) console.error(err);
      currentTrial.value = 0;
      activeCue.value = '';
      currentState.value = 'idle';
      protocolEndReason.value = 'abort';
    } finally {
      exitFullscreen();
      tutorialMode.value = false;
    }

    if (completedSuccessfully) {
      currentTrial.value = 0;
      activeCue.value = '';
      currentState.value = 'idle';
      protocolEndReason.value = 'tutorial-done';
    }
  };

  const abortProtocol = () => {
    abortController.value?.abort();
    breakResolve = null;
    exitFullscreen();
    void emitMarker('ABORTED');
    const mode = activeIngressMode.value;
    if (mode && usesNeuraflowBridgeStreaming(mode)) {
      void bridge.stopStreaming({ waitForDeviceStopped: false }).catch(() => {});
    }
    if (mode) {
      void clearBoundSession(bridge, mode).catch(() => {});
    }
  };

  const resetSession = () => {
    currentState.value = 'idle';
    currentTrial.value = 0;
    activeCue.value = '';
    collectedTrials.value = 0;
    sessionDurationMs.value = 0;
  };

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    abortProtocol();
  });

  const showCue = computed(() => currentState.value === 'cue');
  const showTask = computed(() => currentState.value === 'active');
  const showRest = computed(() => currentState.value === 'iti');
  const showBreak = computed(() => currentState.value === 'break');
  const showBaseline = computed(() => currentState.value === 'baseline');
  const showSummary = computed(() => currentState.value === 'summary');

  return {
    currentState,
    currentTrial,
    totalTrialsRef,
    activeCue,
    isFullscreen,
    protocolEndReason,
    tutorialMode,
    containerRef,
    soundEnabled,
    baselineSecondsLeft,
    cptDigit,
    collectedTrials,
    sessionDurationMs,
    runProtocol,
    runTutorial,
    abortProtocol,
    resetSession,
    continueAfterBreak,
    showCue,
    showTask,
    showRest,
    showBreak,
    showBaseline,
    showSummary,
  };
};
