import { computed, onBeforeUnmount, ref } from 'vue';

class BCIWebSocket {
  private connected = false;
  private url: string;

  constructor(url: string) {
    this.url = url;
    console.log(`[BCI WebSocket] Initializing connection to ${url}...`);
    setTimeout(() => {
      this.connected = true;
      console.log('[BCI WebSocket] Connected successfully.');
    }, 500);
  }

  send(marker: string) {
    const payload = {
      marker,
      timestamp: Date.now(),
    };
    if (this.connected) {
      console.log('%c[BCI WebSocket SEND]', 'color: #4ade80; font-weight: bold;', JSON.stringify(payload));
    } else {
      console.warn('[BCI WebSocket WARN] Cannot send, not connected:', payload);
    }
  }

  close() {
    this.connected = false;
    console.log('[BCI WebSocket] Connection closed.');
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

export const useBciCalibration = (
  config = {
    totalTrials: 40,
    classes: ['LEFT', 'RIGHT'],
    timing: {
      relaxation: 2000,
      cue: 1250,
      execution: 2750,
      rest: 2000,
      itiMin: 500,
      itiMax: 1500,
    },
  },
) => {
  // TODO: Websocek do bci dodać trzeba.
  const ws = new BCIWebSocket('ws://localhost:1337/eeg-sync');
  const abortController = ref<AbortController | null>(null);

  type ProtocolState = 'idle' | 'relaxation' | 'cue' | 'execution' | 'rest' | 'iti' | 'finished';
  const currentState = ref<ProtocolState>('idle');
  const currentTrial = ref(0);
  const activeCue = ref('');
  const isFullscreen = ref(false);

  const containerRef = ref<HTMLElement | null>(null);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.value) {
      await containerRef.value.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
      isFullscreen.value = true;
    }
  };

  const runProtocol = async () => {
    await toggleFullscreen();

    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    currentState.value = 'iti';
    currentTrial.value = 0;

    const sequence = generateSequence(config.classes, config.totalTrials);

    try {
      await exactWait(2000, signal);

      for (let i = 0; i < sequence.length; i++) {
        currentTrial.value = i + 1;
        activeCue.value = sequence[i] || '';

        currentState.value = 'relaxation';
        await exactWait(config.timing.relaxation, signal);

        currentState.value = 'cue';
        playBeep();

        // TODO: Wysłanie flagi (triggera / markera) rozpoczęcia ruchu wyobrażonego (np. LEFT_START) do Kafki
        ws.send(`${activeCue.value}_START`);
        await exactWait(config.timing.cue, signal);

        currentState.value = 'execution';
        await exactWait(config.timing.execution, signal);

        currentState.value = 'rest';

        // TODO: Wysłanie markera oznaczającego REST do bazy treningowej
        ws.send('REST');
        await exactWait(config.timing.rest, signal);

        currentState.value = 'iti';
        const itiTime = config.timing.itiMin + Math.random() * (config.timing.itiMax - config.timing.itiMin);
        await exactWait(itiTime, signal);
      }

      currentState.value = 'finished';
      // TODO: W tym miejscu wysłanie requesta na kafke sygnału CALIBRATION_END
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Aborted') {
        console.log('Protocol manually aborted early.');
        currentState.value = 'idle';
      } else {
        console.error(err);
      }
    } finally {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        isFullscreen.value = false;
      }
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
    config,
    currentState,
    currentTrial,
    activeCue,
    isFullscreen,
    containerRef,
    runProtocol,
    abortProtocol,
    resetSession,
    showCross,
    showCue,
    showBlank,
  };
};
