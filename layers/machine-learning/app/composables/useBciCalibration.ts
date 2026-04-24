import { computed, onBeforeUnmount, ref } from 'vue';

import { useUserSessionStore } from '#layers/auth/app/store/user-session.store';
import { useEegSessionService } from '#layers/eeg-sessions/app/services/eeg-session.service';

class BridgeWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  public connected = false;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    console.log(`[Bridge WS] Connecting to local bridge at ${this.url}...`);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.connected = true;
      console.log('[Bridge WS] Connected to bridge successfully.');
    };

    this.ws.onclose = () => {
      this.connected = false;
      console.log('[Bridge WS] Connection closed. Reconnecting in 2s...');
      setTimeout(() => this.connect(), 2000);
    };

    this.ws.onerror = (err) => {
      console.error('[Bridge WS] Connection error:', err);
    };
  }

  sendEvent(type: string, payloadExtras: Record<string, unknown> = {}) {
    const payload = {
      type,
      ...payloadExtras,
      timestamp: Date.now(),
    };

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
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
  }
}

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
  const ws = new BridgeWebSocket('ws://127.0.0.1:8765');
  const abortController = ref<AbortController | null>(null);

  type ProtocolState = 'idle' | 'relaxation' | 'cue' | 'execution' | 'rest' | 'iti';
  const currentState = ref<ProtocolState>('idle');
  const currentTrial = ref(0);
  const totalTrialsRef = ref(0);
  const activeCue = ref('');
  const isFullscreen = ref(false);
  const protocolEndReason = ref<'success' | 'abort' | null>(null);

  const containerRef = ref<HTMLElement | null>(null);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.value) {
      await containerRef.value.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
      isFullscreen.value = true;
    }
  };

  const runProtocol = async (sessionName = 'Sesja EEG', classes: string[], trialsPerDirection: number) => {
    const sessionStore = useUserSessionStore();
    // @ts-expect-error - TODO: WIP bridge auth
    const token = sessionStore.user?.token;

    if (!token) {
      console.warn('Brak tokenu użytkownika. Możesz napotkać problemy z autoryzacją w bridge.');
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

    ws.sendEvent('SESSION_START', {
      sessionId,
      token,
    });

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

        ws.send(mapMarker[activeCue.value] || 'IDLE');
        await exactWait(TIMING.cue, signal);

        currentState.value = 'execution';
        await exactWait(TIMING.execution, signal);

        currentState.value = 'rest';

        ws.send('REST');
        await exactWait(TIMING.rest, signal);

        currentState.value = 'iti';
        const itiTime = TIMING.itiMin + Math.random() * (TIMING.itiMax - TIMING.itiMin);
        await exactWait(itiTime, signal);
      }

      ws.sendEvent('SESSION_END', { sessionId });

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
      ws.sendEvent('SESSION_ABORTED', { sessionId });
      if (sessionId && !sessionId.startsWith('local-test-session')) {
        await stopSession(sessionId).catch(() => {});
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
    }

    if (completedSuccessfully) {
      currentTrial.value = 0;
      activeCue.value = '';
      currentState.value = 'idle';
      protocolEndReason.value = 'success';
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

    // TODO: Bezpiecznejsze zakończenie komunikacji w wypadku błędu
    ws.send('ABORTED');
  };

  const resetSession = () => {
    currentState.value = 'idle';
  };

  onBeforeUnmount(() => {
    abortProtocol();
    ws.close();
  });

  const showCross = computed(() => ['relaxation', 'cue', 'execution'].includes(currentState.value));
  const showCue = computed(() => currentState.value === 'cue');
  const showBlank = computed(() => ['rest', 'iti'].includes(currentState.value));

  return {
    ws,
    currentState,
    currentTrial,
    totalTrialsRef,
    activeCue,
    isFullscreen,
    protocolEndReason,
    containerRef,
    runProtocol,
    abortProtocol,
    resetSession,
    showCross,
    showCue,
    showBlank,
  };
};
