import { EEG_WS_EVENT } from '../constants/eeg-ws.const';
import { parseEegDisplayBatch } from '../dtos/eeg-display-sample.dto';
import type { ChannelKey, EegSample } from '../models/eeg-display.domain';
import { EEG_CHANNELS, EEG_WINDOW_SIZE } from '../models/eeg-display.domain';

const STREAM_IDLE_MS = 1200;

function exceptionPayloadToMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim() !== '') {
    return payload;
  }
  const hasMessageKey = payload !== null && typeof payload === 'object' && 'message' in payload;
  if (!hasMessageKey) {
    return fallback;
  }
  const message = (payload as { message: unknown }).message;
  if (typeof message !== 'string' || message.trim() === '') {
    return fallback;
  }
  return message;
}

function connectErrorToMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export const useEegDisplay = () => {
  const { $eegDisplaySocket } = useNuxtApp();
  const { t } = useI18n();

  const isConnected = ref(false);
  const wsError = ref<string | null>(null);
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const buffers = reactive<Record<ChannelKey, number[]>>({
    ch1: [],
    ch2: [],
    ch3: [],
    ch4: [],
    ch5: [],
    ch6: [],
    ch7: [],
    ch8: [],
  });

  const clearBuffers = () => {
    for (const ch of EEG_CHANNELS) {
      buffers[ch].splice(0, buffers[ch].length);
    }
  };

  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      clearBuffers();
    }, STREAM_IDLE_MS);
  };

  const pushSamples = (samples: EegSample[]) => {
    for (const s of samples) {
      for (const ch of EEG_CHANNELS) {
        buffers[ch].push(s[ch]);
      }
    }

    const overflow = buffers.ch1.length - EEG_WINDOW_SIZE;
    if (overflow > 0) {
      for (const ch of EEG_CHANNELS) {
        buffers[ch].splice(0, overflow);
      }
    }
  };

  const onLive = (data: unknown) => {
    const samples = parseEegDisplayBatch(data);
    if (samples.length === 0) return;

    pushSamples(samples);
    resetIdleTimer();
  };

  const onConnect = () => {
    isConnected.value = true;
    wsError.value = null;
    resetIdleTimer();
  };

  const onDisconnect = () => {
    isConnected.value = false;
    clearBuffers();
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const onError = (err: unknown) => {
    isConnected.value = false;
    wsError.value = connectErrorToMessage(err);
    clearBuffers();
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    console.error('[EegDisplay]', err);
  };

  const onWsException = (payload: unknown) => {
    wsError.value = exceptionPayloadToMessage(payload, t('eegLive.eeg.errors.server'));
  };

  onMounted(() => {
    $eegDisplaySocket.on('connect', onConnect);
    $eegDisplaySocket.on('disconnect', onDisconnect);
    $eegDisplaySocket.on('connect_error', onError);
    $eegDisplaySocket.on(EEG_WS_EVENT.DISPLAY_LIVE, onLive);
    $eegDisplaySocket.on(EEG_WS_EVENT.EXCEPTION, onWsException);
    $eegDisplaySocket.connect();
  });

  onUnmounted(() => {
    $eegDisplaySocket.off('connect', onConnect);
    $eegDisplaySocket.off('disconnect', onDisconnect);
    $eegDisplaySocket.off('connect_error', onError);
    $eegDisplaySocket.off(EEG_WS_EVENT.DISPLAY_LIVE, onLive);
    $eegDisplaySocket.off(EEG_WS_EVENT.EXCEPTION, onWsException);
    $eegDisplaySocket.disconnect();

    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  });

  return { isConnected, wsError, buffers };
};
