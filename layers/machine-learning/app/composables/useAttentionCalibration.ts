import { useNuxtApp } from 'nuxt/app';
import { computed, onBeforeUnmount, ref } from 'vue';

import { useBridgeConnection } from '#layers/bridge-auth/app/composables/useBridgeConnection';
import { useBridgeStreamService } from '#layers/bridge-auth/app/services/bridge-stream.service';
import { useEegSessionService } from '#layers/eeg-sessions/app/services/eeg-session.service';

import { useBciController } from '../../../../app/composables/useBciController';
import type { EegIngressMode } from '../models/eeg-ingress.domain';
import {
  assertBridgeIngressReady,
  assertLocalWsReady,
  createBoundSession,
  makeLocalMarkerSender,
  makeNeuraflowMarkerSender,
  sendLocalLifecycleEvent,
} from './eeg-ingress.utils';
import { exactWait, generateCptDigits, generateSequence, playTone } from './eeg-protocol.utils';

// ------------- Kalibracja uwagi (FOCUS / RELAX): protokół UI + markery EEG ------

// ------------- Stałe czasowe, liczba prób i sekwencja tutorialu ----------------
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
const ATTENTION_TUTORIAL_SEQUENCE: AttentionClass[] = ['FOCUS', 'RELAX'];

// ------------- Typy: klasa próby (FOCUS/RELAX) i stan maszyny UI -----------------
export type AttentionClass = 'FOCUS' | 'RELAX';
export type AttentionState = 'idle' | 'baseline' | 'cue' | 'active' | 'iti' | 'break' | 'summary';

export const useAttentionCalibration = () => {
  // ------------- Mostek NeuraFlow / WebSocket + wysyłka markerów ---------------
  const bridge = useBridgeConnection();
  const nuxtApp = useNuxtApp();
  const { sendMarker } = useBridgeStreamService();
  const sendNeuraflowAttentionMarker = makeNeuraflowMarkerSender(sendMarker, 'Attention');
  const { isConnected: localWsConnected } = useBciController();

  // ------------- Tryb ingressu (mostek vs lokalnie) i kanał markerów ------------
  const activeIngressMode = ref<EegIngressMode | null>(null);
  const markerSink = ref<((m: string) => Promise<void>) | null>(null);

  const emitMarker = async (marker: string) => {
    await markerSink.value?.(marker);
  };

  // ------------- Stan protokołu, trialu i preferencje UI -------------------------
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

  // ------------- Pełny ekran (kontener z protokołem) ------------------------------
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.value) {
      await containerRef.value.requestFullscreen().catch((err: Error) => {
        console.warn(`Fullscreen request failed: ${err.message}`);
      });
      isFullscreen.value = true;
    }
  };

  // ------------- Wyjście z trybu pełnoekranowego ----------------------------------
  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    isFullscreen.value = false;
  };

  // ------------- Wznowienie protokołu po środkowej przerwie (przycisk UI) --------
  const continueAfterBreak = () => {
    breakResolve?.();
    breakResolve = null;
  };

  // ------------- Baseline przed próbami (znaczniki BASELINE_START/END) -----------
  const runBaseline = async (signal: AbortSignal) => {
    currentState.value = 'baseline';
    baselineSecondsLeft.value = 120;
    await emitMarker('BASELINE_START');
    const start = performance.now();
    while (true) {
      await exactWait(500, signal);
      const elapsed = performance.now() - start;
      baselineSecondsLeft.value = Math.max(0, Math.ceil((ATTENTION_TIMING.baseline - elapsed) / 1000));
      if (elapsed >= ATTENTION_TIMING.baseline) break;
    }
    await emitMarker('BASELINE_END');
  };

  // ------------- Jedna próba: cue → aktywacja (CPT lub relaks) → ITI ------------
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
      const start = performance.now();
      while (true) {
        await exactWait(100, signal);
        if (performance.now() - start >= duration) break;
      }
    }

    if (sendMarkers) await emitMarker(`${cue}_END`);

    currentState.value = 'iti';
    await exactWait(
      ATTENTION_TIMING.itiMin + Math.random() * (ATTENTION_TIMING.itiMax - ATTENTION_TIMING.itiMin),
      signal,
    );
  };

  // ------------- Pełna sesja: wstęp, baseline, próby, przerwa, podsumowanie ----
  const runProtocol = async (
    sessionName = 'Attention Calibration',
    ingressMode: EegIngressMode = 'neuraflow-bridge',
  ) => {
    tutorialMode.value = false;
    activeIngressMode.value = ingressMode;

    try {
      if (ingressMode === 'neuraflow-bridge') {
        await assertBridgeIngressReady(bridge);
      } else {
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

    markerSink.value =
      ingressMode === 'neuraflow-bridge' ? sendNeuraflowAttentionMarker : makeLocalMarkerSender(nuxtApp);

    await toggleFullscreen();

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    currentTrial.value = 0;
    totalTrialsRef.value = ATTENTION_TOTAL_TRIALS;
    collectedTrials.value = 0;
    const sessionStart = Date.now();

    if (ingressMode === 'neuraflow-bridge') {
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
      const { stopSession } = useEegSessionService();
      await stopSession(sessionId);
      completedSuccessfully = true;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Aborted') {
        console.log('Attention protocol manually aborted.');
      } else {
        console.error(err);
      }
      await emitMarker('SESSION_ABORTED');
      const { stopSession } = useEegSessionService();
      await stopSession(sessionId).catch(() => {});
      currentTrial.value = 0;
      activeCue.value = '';
      currentState.value = 'idle';
      protocolEndReason.value = 'abort';
    } finally {
      if (ingressMode === 'neuraflow-bridge') {
        await bridge.stopStreaming({ waitForDeviceStopped: false }).catch(() => {});
      }
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

  // ------------- Tutorial: krótsze próby, bez markerów na EEG -------------------
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

  // ------------- Ręczne przerwanie protokołu (abort + stop mostka) -------------
  const abortProtocol = () => {
    abortController.value?.abort();
    breakResolve = null;
    exitFullscreen();
    void emitMarker('ABORTED');
    if (activeIngressMode.value === 'neuraflow-bridge') {
      void bridge.stopStreaming({ waitForDeviceStopped: false }).catch(() => {});
    }
  };

  // ------------- Stan „idle” po zakończeniu / anulowaniu podsumowania ------------
  const resetSession = () => {
    currentState.value = 'idle';
    currentTrial.value = 0;
    activeCue.value = '';
    collectedTrials.value = 0;
    sessionDurationMs.value = 0;
  };

  // ------------- Sprzątanie: abort przy odmontowaniu komponentu -----------------
  onBeforeUnmount(() => {
    abortProtocol();
  });

  // ------------- Warunki widoku runnera (który krok protokołu wyświetlić) -------
  const showCue = computed(() => currentState.value === 'cue');
  const showTask = computed(() => currentState.value === 'active');
  const showRest = computed(() => currentState.value === 'iti');
  const showBreak = computed(() => currentState.value === 'break');
  const showBaseline = computed(() => currentState.value === 'baseline');
  const showSummary = computed(() => currentState.value === 'summary');

  // ------------- API composablea dla komponentów UI ------------------------------
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
