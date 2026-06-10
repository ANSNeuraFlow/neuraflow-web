import {
  parseRcCarMessage,
  RC_CAR_STATE_KEYS,
  type RcCarBridgeCommand,
  type RcCarBridgeStatus,
  type RcCarCommandAck,
  type RcCarMovement,
} from '../models/rc-car-bridge.domain';

type StatusListener = (status: RcCarBridgeStatus) => void;
type AckListener = (ack: RcCarCommandAck) => void;

const statusListeners = new Set<StatusListener>();
const ackListeners = new Set<AckListener>();

function notifyStatusListeners(status: RcCarBridgeStatus) {
  for (const fn of statusListeners) {
    fn(status);
  }
}

function notifyAckListeners(ack: RcCarCommandAck) {
  for (const fn of ackListeners) {
    fn(ack);
  }
}

export default defineNuxtPlugin(() => {
  const {
    public: { rcCarBridgeUrl: rcCarBridgeUrlRaw },
  } = useRuntimeConfig();

  const rcCarBridgeUrl = String(rcCarBridgeUrlRaw);

  const isConnected = useState<boolean>(RC_CAR_STATE_KEYS.connected, () => false);
  const connectionError = useState<string | null>(RC_CAR_STATE_KEYS.error, () => null);
  const status = useState<RcCarBridgeStatus | null>(RC_CAR_STATE_KEYS.status, () => null);
  const movements = useState<RcCarMovement[]>(RC_CAR_STATE_KEYS.movements, () => []);

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;
  let reconnectAttempt = 0;
  const baseReconnectDelayMs = 3_000;
  const maxReconnectDelayMs = 30_000;

  const scheduleReconnect = () => {
    if (destroyed) return;
    const delay = Math.min(baseReconnectDelayMs * 2 ** reconnectAttempt, maxReconnectDelayMs);
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(connect, delay);
  };

  function connect() {
    if (destroyed) return;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    try {
      ws = new WebSocket(rcCarBridgeUrl);
    } catch {
      connectionError.value = `WebSocket constructor failed (${rcCarBridgeUrl})`;
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      isConnected.value = true;
      connectionError.value = null;
      reconnectAttempt = 0;
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      const parsed = parseRcCarMessage(event.data);
      if (!parsed) return;

      if (parsed.type === 'hello' || parsed.type === 'movements') {
        movements.value = parsed.movements;
        return;
      }

      if (parsed.type === 'status') {
        status.value = parsed;
        notifyStatusListeners(parsed);
        return;
      }

      if (parsed.type === 'command_ack') {
        notifyAckListeners(parsed);
      }
    };

    ws.onclose = () => {
      isConnected.value = false;
      ws = null;
      scheduleReconnect();
    };

    ws.onerror = () => {
      connectionError.value = `RC car bridge (${rcCarBridgeUrl})`;
      ws?.close();
    };
  }

  const disconnect = () => {
    destroyed = true;
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

  const sendCommand = (command: RcCarBridgeCommand, params: Record<string, unknown> = {}): boolean => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      ws.send(
        JSON.stringify({
          type: 'command',
          command,
          params,
        }),
      );
      return true;
    } catch {
      return false;
    }
  };

  connect();

  window.addEventListener('beforeunload', disconnect);

  const subscribeStatus = (fn: StatusListener): (() => void) => {
    statusListeners.add(fn);
    return () => statusListeners.delete(fn);
  };

  const subscribeAck = (fn: AckListener): (() => void) => {
    ackListeners.add(fn);
    return () => ackListeners.delete(fn);
  };

  return {
    provide: {
      rcCarBridge: {
        subscribeStatus,
        subscribeAck,
        reconnect,
        sendCommand,
        isConnected,
        connectionError,
        status,
        movements,
      },
    },
  };
});
