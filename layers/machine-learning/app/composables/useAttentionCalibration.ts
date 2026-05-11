import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';

import { useUserSessionStore } from '#layers/auth/app/store/user-session.store';
import { useEegSessionService } from '#layers/eeg-sessions/app/services/eeg-session.service';

class BridgeWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  public connected = false;
  private destroyed = false;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    if (this.destroyed || !import.meta.client) return;
    if (typeof globalThis.WebSocket === 'undefined') {
      console.warn('[Bridge WS] WebSocket API unavailable in this environment.');
      return;
    }
    try {
      this.ws = new WebSocket(this.url);
    } catch (e) {
      console.error('[Bridge WS] Failed to construct WebSocket:', e);
      if (!this.destroyed) setTimeout(() => this.connect(), 2000);
      return;
    }
    this.ws.onopen = () => {
      this.connected = true;
      console.log('[Bridge WS] Connected to bridge successfully.');
    };
    this.ws.onclose = () => {
      this.connected = false;
      if (!this.destroyed) {
        console.log('[Bridge WS] Connection closed. Reconnecting in 2s...');
        setTimeout(() => this.connect(), 2000);
      }
    };
    this.ws.onerror = (err) => console.error('[Bridge WS] Connection error:', err);
  }

  sendEvent(type: string, payloadExtras: Record<string, unknown> = {}) {
    const payload = { type, ...payloadExtras, timestamp: Date.now() };
    if (this.ws && this.connected) {
      this.ws.send(JSON.stringify(payload));
    } else {
      console.warn('[Bridge WS WARN] Cannot send event, not connected:', payload);
    }
  }

  send(marker: string) {
    this.sendEvent('MARKER', { marker });
  }

  close() {
    this.destroyed = true;
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }
}

const exactWait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const start = performance.now();
    const frame = (time: DOMHighResTimeStamp) => {
      if (signal?.aborted) return reject(new Error('Aborted'));
      if (time - start >= ms) resolve();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

const playTone = (frequency: number, duration = 0.2) => {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error('Failed to play tone:', e);
  }
};

const generateSequence = (classes: string[], total: number): string[] => {
  const perClass = Math.floor(total / classes.length);
  const seq: string[] = [];
  classes.forEach((cls) => {
    for (let i = 0; i < perClass; i++) seq.push(cls);
  });
  for (let i = seq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = seq[i];
    seq[i] = seq[j] as string;
    seq[j] = tmp as string;
  }
  return seq;
};

const generateCptDigits = (count: number): string[] => {
  const noGoCount = Math.max(1, Math.round(count * 0.3));
  const goPool = [0, 1, 2, 4, 5, 6, 7, 8, 9];
  const digits: string[] = [];

  for (let i = 0; i < noGoCount; i++) digits.push('3');
  for (let i = noGoCount; i < count; i++) {
    digits.push(String(goPool[Math.floor(Math.random() * goPool.length)]!));
  }

  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = digits[i]!;
    digits[i] = digits[j]!;
    digits[j] = tmp;
  }

  return digits;
};

const TIMING = {
  cue: 2000,
  focusActive: 15_000,
  relaxActive: 12_000,
  focusActiveTutorial: 6_000,
  relaxActiveTutorial: 6_000,
  itiMin: 1000,
  itiMax: 2000,
  baseline: 120_000,
  cptDigitInterval: 1500,
  cptSettleMs: 3000,
} as const;

const TOTAL_TRIALS = 40;
const BREAK_AFTER_TRIAL = 20;

export type AttentionClass = 'FOCUS' | 'RELAX';
export type AttentionState = 'idle' | 'baseline' | 'cue' | 'active' | 'iti' | 'break' | 'summary';

export const useAttentionCalibration = () => {
  const config = useRuntimeConfig();
  const wsRef = shallowRef<BridgeWebSocket | null>(null);

  onMounted(() => {
    wsRef.value = new BridgeWebSocket(String(config.public.bciWsUrl));
  });

  const abortController = ref<AbortController | null>(null);

  const currentState = ref<AttentionState>('idle');
  const currentTrial = ref(0);
  const totalTrialsRef = ref(TOTAL_TRIALS);
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

  const bridgeSendEvent = (type: string, extras: Record<string, unknown> = {}) => {
    wsRef.value?.sendEvent(type, extras);
  };

  const bridgeSendMarker = (marker: string) => {
    wsRef.value?.send(marker);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.value) {
      await containerRef.value.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
      isFullscreen.value = true;
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    isFullscreen.value = false;
  };

  const continueAfterBreak = () => {
    breakResolve?.();
    breakResolve = null;
  };

  const runBaseline = async (signal: AbortSignal) => {
    currentState.value = 'baseline';
    baselineSecondsLeft.value = 120;
    bridgeSendMarker('BASELINE_START');

    const start = performance.now();
    while (true) {
      await exactWait(500, signal);
      const elapsed = performance.now() - start;
      baselineSecondsLeft.value = Math.max(0, Math.ceil((TIMING.baseline - elapsed) / 1000));
      if (elapsed >= TIMING.baseline) break;
    }

    bridgeSendMarker('BASELINE_END');
  };

  const runTrial = async (cue: AttentionClass, signal: AbortSignal, sendMarkers: boolean, tutorial = false) => {
    activeCue.value = cue;
    cptDigit.value = null;

    currentState.value = 'cue';
    if (sendMarkers) bridgeSendMarker(`${cue}_CUE`);
    if (soundEnabled.value) playTone(cue === 'FOCUS' ? 880 : 440);
    await exactWait(TIMING.cue, signal);

    currentState.value = 'active';
    if (sendMarkers) bridgeSendMarker(`${cue}_START`);

    if (cue === 'FOCUS') {
      const focusDuration = tutorial ? TIMING.focusActiveTutorial : TIMING.focusActive;
      const digitCount = Math.round(focusDuration / TIMING.cptDigitInterval);
      const digits = generateCptDigits(digitCount);
      for (let i = 0; i < digits.length; i++) {
        cptDigit.value = digits[i]!;
        await exactWait(TIMING.cptDigitInterval, signal);
      }
    } else {
      const relaxDuration = tutorial ? TIMING.relaxActiveTutorial : TIMING.relaxActive;
      const start = performance.now();
      while (true) {
        await exactWait(100, signal);
        const elapsed = performance.now() - start;
        if (elapsed >= relaxDuration) break;
      }
    }

    if (sendMarkers) bridgeSendMarker(`${cue}_END`);

    currentState.value = 'iti';
    const itiTime = TIMING.itiMin + Math.random() * (TIMING.itiMax - TIMING.itiMin);
    await exactWait(itiTime, signal);
  };

  const runProtocol = async (sessionName = 'Attention Calibration') => {
    tutorialMode.value = false;

    const sessionStore = useUserSessionStore();
    // @ts-expect-error - TODO: WIP bridge auth
    const token = sessionStore.user?.token;

    if (!token) {
      console.warn('Brak tokenu użytkownika. Możesz napotkać problemy z autoryzacją w bridge.');
    }

    const { createSession, stopSession } = useEegSessionService();
    let sessionId: string | null = null;

    try {
      const session = await createSession({ sessionName, protocolName: 'attention' });
      sessionId = session.id;
    } catch (err) {
      console.error('Failed to create EEG session via API:', err);
      sessionId = 'local-attention-session-' + Date.now();
    }

    await toggleFullscreen();

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    currentTrial.value = 0;
    totalTrialsRef.value = TOTAL_TRIALS;
    collectedTrials.value = 0;
    const sessionStart = Date.now();

    bridgeSendEvent('SESSION_START', { sessionId, token, protocol: 'attention' });

    const sequence = generateSequence(['FOCUS', 'RELAX'], TOTAL_TRIALS) as AttentionClass[];
    let completedSuccessfully = false;

    try {
      await runBaseline(signal);
      currentState.value = 'iti';
      await exactWait(2000, signal);

      for (let i = 0; i < sequence.length; i++) {
        currentTrial.value = i + 1;

        if (i === BREAK_AFTER_TRIAL) {
          exitFullscreen();
          currentState.value = 'break';
          bridgeSendMarker('BREAK_START');

          await new Promise<void>((resolve, reject) => {
            breakResolve = resolve;
            signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
          });

          bridgeSendMarker('BREAK_END');
          await toggleFullscreen();
        }

        await runTrial(sequence[i]!, signal, true);
        collectedTrials.value = i + 1;
      }

      bridgeSendMarker('SESSION_END');
      bridgeSendEvent('SESSION_END_EVENT', { sessionId });

      if (sessionId && !sessionId.startsWith('local-attention-session')) {
        await stopSession(sessionId);
      }

      completedSuccessfully = true;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Aborted') {
        console.log('Attention protocol manually aborted.');
      } else {
        console.error(err);
      }
      bridgeSendEvent('SESSION_ABORTED', { sessionId });
      if (sessionId && !sessionId.startsWith('local-attention-session')) {
        await stopSession(sessionId).catch(() => {});
      }
      currentTrial.value = 0;
      activeCue.value = '';
      currentState.value = 'idle';
      protocolEndReason.value = 'abort';
    } finally {
      exitFullscreen();
      breakResolve = null;
    }

    if (completedSuccessfully) {
      sessionDurationMs.value = Date.now() - sessionStart;
      currentState.value = 'summary';
    }
  };

  const TUTORIAL_SEQUENCE: AttentionClass[] = ['FOCUS', 'RELAX'];

  const runTutorial = async () => {
    tutorialMode.value = true;
    totalTrialsRef.value = TUTORIAL_SEQUENCE.length;

    await toggleFullscreen();

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    currentTrial.value = 0;
    currentState.value = 'iti';
    let completedSuccessfully = false;

    try {
      await exactWait(1000, signal);

      for (let i = 0; i < TUTORIAL_SEQUENCE.length; i++) {
        currentTrial.value = i + 1;
        await runTrial(TUTORIAL_SEQUENCE[i]!, signal, false, true);
      }

      completedSuccessfully = true;
    } catch (err: unknown) {
      if (!(err instanceof Error && err.message === 'Aborted')) {
        console.error(err);
      }
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
    // TODO: Bezpiecznejsze zakończenie komunikacji w wypadku błędu
    bridgeSendMarker('ABORTED');
  };

  const resetSession = () => {
    currentState.value = 'idle';
    currentTrial.value = 0;
    activeCue.value = '';
    collectedTrials.value = 0;
    sessionDurationMs.value = 0;
  };

  onBeforeUnmount(() => {
    abortProtocol();
    wsRef.value?.close();
    wsRef.value = null;
  });

  const showCue = computed(() => currentState.value === 'cue');
  const showTask = computed(() => currentState.value === 'active');
  const showRest = computed(() => currentState.value === 'iti');
  const showBreak = computed(() => currentState.value === 'break');
  const showBaseline = computed(() => currentState.value === 'baseline');
  const showSummary = computed(() => currentState.value === 'summary');

  return {
    ws: wsRef,
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
