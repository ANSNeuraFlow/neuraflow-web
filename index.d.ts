import type { Socket } from 'socket.io-client';
import type { Ref } from 'vue';

import type { BciCommandPayload, SsvepScoresPayload } from './app/models/bci.domain';
import type { Permission } from './layers/auth/app/models/user.domain';
import type {
  RcCarBridgeStatus,
  RcCarCommandAck,
  RcCarMovement,
} from './layers/remote/app/models/rc-car-bridge.domain';

interface BciBridgePluginApi {
  subscribePayload: (fn: (payload: BciCommandPayload) => void) => () => void;
  subscribeScores: (fn: (payload: SsvepScoresPayload) => void) => () => void;
  reconnect: () => void;
  sendJson: (payload: Record<string, unknown>) => boolean;
  ssvepScores: Ref<Record<string, number>>;
}

interface RcCarBridgePluginApi {
  subscribeStatus: (fn: (status: RcCarBridgeStatus) => void) => () => void;
  subscribeAck: (fn: (ack: RcCarCommandAck) => void) => () => void;
  reconnect: () => void;
  sendCommand: (command: string, params?: Record<string, unknown>) => boolean;
  isConnected: Ref<boolean>;
  connectionError: Ref<string | null>;
  status: Ref<RcCarBridgeStatus | null>;
  movements: Ref<RcCarMovement[]>;
}

declare module '#app' {
  interface NuxtApp {
    $clusterSocket: Socket;
    $eegDisplaySocket: Socket;
    $bciBridge?: BciBridgePluginApi;
    $rcCarBridge?: RcCarBridgePluginApi;
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
    $rcCarBridge?: RcCarBridgePluginApi;
  }
}

export {};
