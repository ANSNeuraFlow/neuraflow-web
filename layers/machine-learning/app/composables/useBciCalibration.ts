import { useWakeLock } from '@vueuse/core';
import { computed, onBeforeUnmount, ref } from 'vue';

import { useBridgeConnection } from '#layers/bridge-auth/app/composables/useBridgeConnection';
import { useBridgeStreamService } from '#layers/bridge-auth/app/services/bridge-stream.service';
import { useEegSessionService } from '#layers/eeg-sessions/app/services/eeg-session.service';

const exactWait = (ms: number, signal?: AbortSignal) => {
  return new Promise<void>((resolve, reject) => {
    const start = performance.now();
    const frame = (time: DOMHighResTimeStamp) => {
      if (signal?.aborted) {
        return reject(new Error('Aborted'));
      }
      if (time - start >= ms) {
        resolve();
      } else {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  });
};

const playBeep = () => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.error('Failed to play audio cue:', e);
  }
};

const generateSequence = (classes: string[], total: number) => {
  const perClass = Math.floor(total / classes.length);
  const sequence: string[] = [];

  classes.forEach((cls) => {
    for (let i = 0; i < perClass; i++) sequence.push(cls);
  });

  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = sequence[i];
    sequence[i] = sequence[j] as string;
    sequence[j] = temp as string;
  }

  return sequence;
};

const TIMING = {
  relaxation: 2000,
  cue: 1250,
  execution: 2750,
  rest: 2000,
  itiMin: 500,
  itiMax: 1500,
};

export interface BciRunConfig {
  classes: string[];
  trialsPerDirection: number;
}

export const useBciCalibration = () => {
  const bridge = useBridgeConnection();
  const { sendMarker } = useBridgeStreamService();

  const { isSupported: wakeLockSupported, request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  const bridgeSendMarker = async (marker: string) => {
    try {
      await sendMarker(marker);
    } catch (e) {
      console.error('[BCI] Marker send failed:', e);
    }
  };

  const abortController = ref<AbortController | null>(null);

  type ProtocolState = 'idle' | 'relaxation' | 'cue' | 'execution' | 'rest' | 'iti';
  const currentState = ref<ProtocolState>('idle');
  const currentTrial = ref(0);
  const totalTrialsRef = ref(0);
  const activeCue = ref('');
  const isFullscreen = ref(false);
  const protocolEndReason = ref<'success' | 'abort' | 'tutorial-done' | null>(null);
  const tutorialMode = ref(false);

  const containerRef = ref<HTMLElement | null>(null);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.value) {
      await containerRef.value.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
      isFullscreen.value = true;
      if (wakeLockSupported.value) {
        await requestWakeLock('screen').catch((err) => {
          console.warn('Wake lock request failed:', err);
        });
      }
    }
  };

  const runProtocol = async (sessionName = 'Sesja EEG', classes: string[], trialsPerDirection: number) => {
    await bridge.fetchStatus();
    if (!bridge.isStreaming.value) {
      console.error('BCI protocol requires active EEG streaming. Use "Start streaming" in the session dialog first.');
      return;
    }

    const totalTrials = classes.length * trialsPerDirection;
    totalTrialsRef.value = totalTrials;

    const { createSession, stopSession } = useEegSessionService();
    let sessionId: string | null = null;

    try {
      const session = await createSession({
        sessionName,
        protocolName: 'move_left',
      });
      sessionId = session.id;
    } catch (err) {
      console.error('Failed to create an EEG session via API:', err);
      sessionId = 'local-test-session-' + Date.now();
    }

    await toggleFullscreen();

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    currentState.value = 'iti';
    currentTrial.value = 0;

    await bridgeSendMarker('SESSION_START');

    const sequence = generateSequence(classes, totalTrials);

    let completedSuccessfully = false;

    try {
      await exactWait(2000, signal);

      for (let i = 0; i < sequence.length; i++) {
        currentTrial.value = i + 1;
        activeCue.value = sequence[i] || '';

        currentState.value = 'relaxation';
        await exactWait(TIMING.relaxation, signal);

        currentState.value = 'cue';
        playBeep();

        const mapMarker: Record<string, string> = {
          LEFT: 'LEFT_HAND',
          RIGHT: 'RIGHT_HAND',
          UP: 'BOTH_HANDS',
          DOWN: 'FEET',
        };

        await bridgeSendMarker(mapMarker[activeCue.value] || 'IDLE');
        await exactWait(TIMING.cue, signal);

        currentState.value = 'execution';
        await exactWait(TIMING.execution, signal);

        currentState.value = 'rest';

        await bridgeSendMarker('REST');
        await exactWait(TIMING.rest, signal);

        currentState.value = 'iti';
        const itiTime = TIMING.itiMin + Math.random() * (TIMING.itiMax - TIMING.itiMin);
        await exactWait(itiTime, signal);
      }

      await bridgeSendMarker('SESSION_END');

      if (sessionId && !sessionId.startsWith('local-test-session')) {
        await stopSession(sessionId);
      }

      completedSuccessfully = true;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Aborted') {
        console.log('Protocol manually aborted early.');
      } else {
        console.error(err);
      }
      await bridgeSendMarker('SESSION_ABORTED');
      if (sessionId && !sessionId.startsWith('local-test-session')) {
        await stopSession(sessionId).catch(() => {});
      }
      currentTrial.value = 0;
      activeCue.value = '';
      currentState.value = 'idle';
      protocolEndReason.value = 'abort';
    } finally {
      await bridge.stopStreaming().catch(() => {});
      if (document.fullscreenElement) {
        document.exitFullscreen();
        isFullscreen.value = false;
      }
      await releaseWakeLock().catch(() => {});
    }

    if (completedSuccessfully) {
      currentTrial.value = 0;
      activeCue.value = '';
      currentState.value = 'idle';
      protocolEndReason.value = 'success';
    }
  };

  const TUTORIAL_SEQUENCE: string[] = ['LEFT', 'RIGHT', 'LEFT', 'RIGHT'];

  const runTutorial = async () => {
    tutorialMode.value = true;
    totalTrialsRef.value = TUTORIAL_SEQUENCE.length;

    await toggleFullscreen();

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    currentState.value = 'iti';
    currentTrial.value = 0;

    let completedSuccessfully = false;

    try {
      await exactWait(2000, signal);

      for (let i = 0; i < TUTORIAL_SEQUENCE.length; i++) {
        currentTrial.value = i + 1;
        activeCue.value = TUTORIAL_SEQUENCE[i]!;

        currentState.value = 'relaxation';
        await exactWait(TIMING.relaxation, signal);

        currentState.value = 'cue';
        playBeep();
        await exactWait(TIMING.cue, signal);

        currentState.value = 'execution';
        await exactWait(TIMING.execution, signal);

        currentState.value = 'rest';
        await exactWait(TIMING.rest, signal);

        currentState.value = 'iti';
        const itiTime = TIMING.itiMin + Math.random() * (TIMING.itiMax - TIMING.itiMin);
        await exactWait(itiTime, signal);
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
      if (document.fullscreenElement) {
        document.exitFullscreen();
        isFullscreen.value = false;
      }
      await releaseWakeLock().catch(() => {});
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
    if (abortController.value) {
      abortController.value.abort();
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
      isFullscreen.value = false;
    }

    void releaseWakeLock().catch(() => {});

    void bridgeSendMarker('ABORTED');
    void bridge.stopStreaming().catch(() => {});
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
