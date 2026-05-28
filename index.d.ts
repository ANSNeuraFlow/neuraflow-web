import type { Socket } from 'socket.io-client';
import type { Ref } from 'vue';

import type { BciCommandPayload } from './app/models/bci.domain';
import type { Permission } from './layers/auth/app/models/user.domain';
import type { DroneCommand, DroneCommandParams } from './layers/remote/app/models/drone-control.domain';
import type {
  MavlinkCommandAckMessage,
  MavlinkStatusMessage,
  MavlinkTelemetryMessage,
} from './layers/remote/app/models/mavlink-bridge.domain';

interface BciBridgePluginApi {
  subscribePayload: (fn: (payload: BciCommandPayload) => void) => () => void;
  reconnect: () => void;
  sendJson: (payload: Record<string, unknown>) => boolean;
}

interface MavlinkBridgePluginApi {
  isConnected: Ref<boolean>;
  connectionError: Ref<string | null>;
  sendCommand: (command: DroneCommand, params?: DroneCommandParams) => boolean;
  onTelemetry: (fn: (msg: MavlinkTelemetryMessage) => void) => () => void;
  onStatus: (fn: (msg: MavlinkStatusMessage) => void) => () => void;
  onCommandAck: (fn: (msg: MavlinkCommandAckMessage) => void) => () => void;
  reconnect: () => void;
  disconnect: () => void;
}

declare module '#app' {
  interface NuxtApp {
    $clusterSocket: Socket;
    $eegDisplaySocket: Socket;
    $bciBridge?: BciBridgePluginApi;
    $mavlinkBridge: MavlinkBridgePluginApi;
  }

  interface PageMeta {
    title?: string;
    requiredPermissions?: Permission[];
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $clusterSocket: Socket;
    $eegDisplaySocket: Socket;
    $bciBridge?: BciBridgePluginApi;
    $mavlinkBridge: MavlinkBridgePluginApi;
  }
}

export {};
