import type { DroneCommand, DroneCommandParams } from '../models/drone-control.domain';
import {
  type MavlinkBridgeInboundMessage,
  type MavlinkCommandAckMessage,
  type MavlinkStatusMessage,
  type MavlinkTelemetryMessage,
  parseMavlinkBridgeMessage,
} from '../models/mavlink-bridge.domain';

type TelemetryListener = (msg: MavlinkTelemetryMessage) => void;
type StatusListener = (msg: MavlinkStatusMessage) => void;
type CommandAckListener = (msg: MavlinkCommandAckMessage) => void;

const telemetryListeners = new Set<TelemetryListener>();
const statusListeners = new Set<StatusListener>();
const commandAckListeners = new Set<CommandAckListener>();

function notifyTelemetry(msg: MavlinkTelemetryMessage) {
  for (const fn of telemetryListeners) fn(msg);
}

function notifyStatus(msg: MavlinkStatusMessage) {
  for (const fn of statusListeners) fn(msg);
}

function notifyCommandAck(msg: MavlinkCommandAckMessage) {
  for (const fn of commandAckListeners) fn(msg);
}

function dispatchInbound(msg: MavlinkBridgeInboundMessage) {
  if (msg.type === 'telemetry') notifyTelemetry(msg);
  else if (msg.type === 'status') notifyStatus(msg);
  else if (msg.type === 'command_ack') notifyCommandAck(msg);
}

export default defineNuxtPlugin(() => {
  const {
    public: { mavlinkBridgeUrl: mavlinkBridgeUrlRaw },
  } = useRuntimeConfig();

  const mavlinkBridgeUrl = String(mavlinkBridgeUrlRaw);

  const isConnected = useState<boolean>('mavlink-bridge-connected', () => false);
  const connectionError = useState<string | null>('mavlink-bridge-error', () => null);

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
      ws = new WebSocket(mavlinkBridgeUrl);
    } catch {
      connectionError.value = `WebSocket constructor failed (${mavlinkBridgeUrl})`;
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      isConnected.value = true;
      connectionError.value = null;
      reconnectAttempt = 0;
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      const parsed = parseMavlinkBridgeMessage(event.data);
      if (parsed) dispatchInbound(parsed);
    };

    ws.onclose = () => {
      isConnected.value = false;
      ws = null;
      scheduleReconnect();
    };

    ws.onerror = () => {
      connectionError.value = `MAVLink bridge (${mavlinkBridgeUrl})`;
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
    isConnected.value = false;
  };

  const reconnect = () => {
    destroyed = false;
    reconnectAttempt = 0;
    if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) {
      return;
    }
    connect();
  };

  const sendCommand = (command: DroneCommand, params?: DroneCommandParams): boolean => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      ws.send(
        JSON.stringify({
          type: 'command',
          command,
          params: params ?? {},
          timestamp: Date.now(),
        }),
      );
      return true;
    } catch {
      return false;
    }
  };

  connect();
  window.addEventListener('beforeunload', disconnect);

  const onTelemetry = (fn: TelemetryListener): (() => void) => {
    telemetryListeners.add(fn);
    return () => telemetryListeners.delete(fn);
  };

  const onStatus = (fn: StatusListener): (() => void) => {
    statusListeners.add(fn);
    return () => statusListeners.delete(fn);
  };

  const onCommandAck = (fn: CommandAckListener): (() => void) => {
    commandAckListeners.add(fn);
    return () => commandAckListeners.delete(fn);
  };

  return {
    provide: {
      mavlinkBridge: {
        isConnected,
        connectionError,
        sendCommand,
        onTelemetry,
        onStatus,
        onCommandAck,
        reconnect,
        disconnect,
      },
    },
  };
});
