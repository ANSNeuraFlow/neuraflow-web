import {
  BCI_COMMAND_HOLD_MS,
  BCI_STATE_KEYS,
  type BciAction,
  type BciCommandPayload,
  parseBciMessage,
} from '../models/bci.domain';

type PayloadListener = (payload: BciCommandPayload) => void;

const payloadListeners = new Set<PayloadListener>();

function notifyPayloadListeners(payload: BciCommandPayload) {
  for (const fn of payloadListeners) {
    fn(payload);
  }
}

export default defineNuxtPlugin(() => {
  const {
    public: { bciWsUrl },
  } = useRuntimeConfig();

  const currentCommand = useState<BciAction | null>(BCI_STATE_KEYS.command, () => null);
  const currentConfidence = useState<number>(BCI_STATE_KEYS.confidence, () => 0);
  const isConnected = useState<boolean>(BCI_STATE_KEYS.connected, () => false);
  const connectionError = useState<string | null>(BCI_STATE_KEYS.error, () => null);

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let commandHoldTimer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;
  let reconnectAttempt = 0;
  const maxReconnectAttempts = 10;
  const reconnectDelayMs = 3000;

  const clearCommandHold = () => {
    if (commandHoldTimer) {
      clearTimeout(commandHoldTimer);
      commandHoldTimer = null;
    }
  };

  const resetCommandHold = () => {
    clearCommandHold();
    commandHoldTimer = setTimeout(() => {
      currentCommand.value = null;
      currentConfidence.value = 0;
      commandHoldTimer = null;
    }, BCI_COMMAND_HOLD_MS);
  };

  const applyPayload = (payload: BciCommandPayload) => {
    currentCommand.value = payload.command;
    currentConfidence.value = payload.confidence;
    resetCommandHold();
    notifyPayloadListeners(payload);
  };

  const scheduleReconnect = () => {
    if (destroyed || reconnectAttempt >= maxReconnectAttempts) return;
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(connect, reconnectDelayMs);
  };

  function connect() {
    if (destroyed) return;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    ws = new WebSocket(bciWsUrl);

    ws.onopen = () => {
      isConnected.value = true;
      connectionError.value = null;
      reconnectAttempt = 0;
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      const payload = parseBciMessage(event.data);
      if (payload) applyPayload(payload);
    };

    ws.onclose = () => {
      isConnected.value = false;
      ws = null;
      scheduleReconnect();
    };

    ws.onerror = () => {
      connectionError.value = `BCI bridge (${bciWsUrl})`;
      ws?.close();
    };
  }

  const disconnect = () => {
    destroyed = true;
    clearCommandHold();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    ws?.close();
    ws = null;
  };

  const reconnect = () => {
    destroyed = false;
    reconnectAttempt = 0;
    if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
      return;
    }
    connect();
  };

  connect();

  window.addEventListener('beforeunload', disconnect);

  const subscribePayload = (fn: PayloadListener): (() => void) => {
    payloadListeners.add(fn);
    return () => payloadListeners.delete(fn);
  };

  return {
    provide: {
      bciBridge: {
        subscribePayload,
        reconnect,
      },
    },
  };
});
