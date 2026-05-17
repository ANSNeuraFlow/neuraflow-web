import { useWakeLock } from '@vueuse/core';
import { useNuxtApp } from 'nuxt/app';
import { computed, onBeforeUnmount, ref } from 'vue';

import { useBridgeConnection } from '#layers/bridge-auth/app/composables/useBridgeConnection';
import { useBridgeStreamService } from '#layers/bridge-auth/app/services/bridge-stream.service';
import { useEegSessionService } from '#layers/eeg-sessions/app/services/eeg-session.service';
import { useBciController } from '~/composables/useBciController';

import type { EegIngressMode } from '../models/eeg-ingress.domain';
import {
  assertBridgeIngressReady,
  assertLocalWsReady,
  createBoundSession,
  makeLocalMarkerSender,
  makeNeuraflowMarkerSender,
  resolveBciEegProtocolId,
  sendLocalLifecycleEvent,
} from './eeg-ingress.utils';
import { exactWait, generateSequence, playTone } from './eeg-protocol.utils';

const BCI_TIMING = {
  relaxation: 2000,
  cue: 1250,
  execution: 2750,
  rest: 2000,
  itiMin: 500,
  itiMax: 1500,
} as const;

const BCI_MARKER_MAP: Record<string, string> = {
  LEFT: 'LEFT_HAND',
  RIGHT: 'RIGHT_HAND',
  UP: 'BOTH_HANDS',
  DOWN: 'FEET',
};

const BCI_TUTORIAL_SEQUENCE: string[] = ['LEFT', 'RIGHT', 'LEFT', 'RIGHT'];

export type BciProtocolState = 'idle' | 'relaxation' | 'cue' | 'execution' | 'rest' | 'iti';

export interface BciRunConfig {
  classes: string[];
  trialsPerDirection: number;
}

export const useBciCalibration = () => {
  const bridge = useBridgeConnection();
  const nuxtApp = useNuxtApp();
  const { sendMarker } = useBridgeStreamService();
  const { stopSession } = useEegSessionService();
  const sendNeuraflowBciMarker = makeNeuraflowMarkerSender(sendMarker, 'BCI');
  const { isConnected: localWsConnected } = useBciController();

  const { isSupported: wakeLockSupported, request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  const activeIngressMode = ref<EegIngressMode | null>(null);
  const markerSink = ref<((m: string) => Promise<void>) | null>(null);

  const emitMarker = async (marker: string) => {
    await markerSink.value?.(marker);
  };

  const abortController = ref<AbortController | null>(null);
  const currentState = ref<BciProtocolState>('idle');
  const currentTrial = ref(0);
  const totalTrialsRef = ref(0);
  const activeCue = ref('');
  const isFullscreen = ref(false);
  const protocolEndReason = ref<'success' | 'abort' | 'tutorial-done' | null>(null);
  const tutorialMode = ref(false);
  const containerRef = ref<HTMLElement | null>(null);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.value) {
      await containerRef.value.requestFullscreen().catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Fullscreen request failed: ${msg}`);
      });
      isFullscreen.value = true;
      if (wakeLockSupported.value) {
        await requestWakeLock('screen').catch((err: unknown) => {
          console.warn('Wake lock request failed:', err instanceof Error ? err.message : String(err));
        });
      }
    }
  };

  const exitFullscreen = () => {
    void releaseWakeLock();
    if (document.fullscreenElement) document.exitFullscreen();
    isFullscreen.value = false;
  };

  const runProtocol = async (
    sessionName = 'Sesja EEG',
    classes: string[],
    trialsPerDirection: number,
    ingressMode: EegIngressMode = 'neuraflow-bridge',
  ) => {
    activeIngressMode.value = ingressMode;

    try {
      if (ingressMode === 'neuraflow-bridge') {
        await assertBridgeIngressReady(bridge);
      } else {
        assertLocalWsReady(localWsConnected);
      }
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      console.error(`BCI prerequisites not met (${code}).`);
      activeIngressMode.value = null;
      return;
    }

    let sessionId: string;
    try {
      sessionId = await createBoundSession(sessionName, resolveBciEegProtocolId(classes), bridge, ingressMode);
    } catch (e) {
      console.error('Cannot start BCI calibration without server session and Kafka bridge binding:', e);
      bridge.error.value = e instanceof Error ? e.message : 'EEG session or bridge binding failed.';
      activeIngressMode.value = null;
      return;
    }

    markerSink.value = ingressMode === 'neuraflow-bridge' ? sendNeuraflowBciMarker : makeLocalMarkerSender(nuxtApp);

    const notifyLifecycle = async (kind: 'SESSION_START' | 'SESSION_END' | 'SESSION_ABORTED') => {
      if (ingressMode === 'neuraflow-bridge') {
        await emitMarker(kind);
      } else {
        sendLocalLifecycleEvent(nuxtApp, kind, sessionId, '');
      }
    };

    const totalTrials = classes.length * trialsPerDirection;
    totalTrialsRef.value = totalTrials;

    await toggleFullscreen();

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    currentState.value = 'iti';
    currentTrial.value = 0;

    await notifyLifecycle('SESSION_START');

    const sequence = generateSequence(classes, totalTrials);
    let completedSuccessfully = false;

    try {
      await exactWait(2000, signal);

      for (let i = 0; i < sequence.length; i++) {
        currentTrial.value = i + 1;
        activeCue.value = sequence[i] ?? '';

        currentState.value = 'relaxation';
        await exactWait(BCI_TIMING.relaxation, signal);

        currentState.value = 'cue';
        playTone(800, 0.15);
        await emitMarker(BCI_MARKER_MAP[activeCue.value] ?? 'IDLE');
        await exactWait(BCI_TIMING.cue, signal);

        currentState.value = 'execution';
        await exactWait(BCI_TIMING.execution, signal);

        currentState.value = 'rest';
        await emitMarker('REST');
        await exactWait(BCI_TIMING.rest, signal);

        currentState.value = 'iti';
        await exactWait(BCI_TIMING.itiMin + Math.random() * (BCI_TIMING.itiMax - BCI_TIMING.itiMin), signal);
      }

      await notifyLifecycle('SESSION_END');
      await stopSession(sessionId);
      completedSuccessfully = true;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Aborted') {
        console.log('BCI protocol manually aborted.');
      } else {
        console.error(err);
      }
      await notifyLifecycle('SESSION_ABORTED');
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
    }

    if (completedSuccessfully) {
      currentTrial.value = 0;
      activeCue.value = '';
      currentState.value = 'idle';
      protocolEndReason.value = 'success';
    }
  };

  const runTutorial = async () => {
    tutorialMode.value = true;
    totalTrialsRef.value = BCI_TUTORIAL_SEQUENCE.length;

    await toggleFullscreen();

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    currentState.value = 'iti';
    currentTrial.value = 0;
    let completedSuccessfully = false;

    try {
      await exactWait(2000, signal);

      for (let i = 0; i < BCI_TUTORIAL_SEQUENCE.length; i++) {
        currentTrial.value = i + 1;
        activeCue.value = BCI_TUTORIAL_SEQUENCE[i]!;

        currentState.value = 'relaxation';
        await exactWait(BCI_TIMING.relaxation, signal);

        currentState.value = 'cue';
        playTone(800, 0.15);
        await exactWait(BCI_TIMING.cue, signal);

        currentState.value = 'execution';
        await exactWait(BCI_TIMING.execution, signal);

        currentState.value = 'rest';
        await exactWait(BCI_TIMING.rest, signal);

        currentState.value = 'iti';
        await exactWait(BCI_TIMING.itiMin + Math.random() * (BCI_TIMING.itiMax - BCI_TIMING.itiMin), signal);
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
    exitFullscreen();
    void emitMarker('ABORTED');
    if (activeIngressMode.value === 'neuraflow-bridge') {
      void bridge.stopStreaming({ waitForDeviceStopped: false }).catch(() => {});
    }
  };

  const resetSession = () => {
    currentState.value = 'idle';
  };

  onBeforeUnmount(() => {
    abortProtocol();
  });

  const showCross = computed(() => ['relaxation', 'cue', 'execution'].includes(currentState.value));
  const showCue = computed(() => currentState.value === 'cue');
  const showBlank = computed(() => ['rest', 'iti'].includes(currentState.value));

  return {
    currentState,
    currentTrial,
    totalTrialsRef,
    activeCue,
    isFullscreen,
    protocolEndReason,
    tutorialMode,
    containerRef,
    runProtocol,
    runTutorial,
    abortProtocol,
    resetSession,
    showCross,
    showCue,
    showBlank,
  };
};
