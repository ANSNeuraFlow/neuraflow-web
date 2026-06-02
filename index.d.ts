import type { Socket } from 'socket.io-client';
import type { Ref } from 'vue';

import type { BciCommandPayload, SsvepScoresPayload } from './app/models/bci.domain';
import type { Permission } from './layers/auth/app/models/user.domain';

interface BciBridgePluginApi {
  subscribePayload: (fn: (payload: BciCommandPayload) => void) => () => void;
  subscribeScores: (fn: (payload: SsvepScoresPayload) => void) => () => void;
  reconnect: () => void;
  sendJson: (payload: Record<string, unknown>) => boolean;
  ssvepScores: Ref<Record<string, number>>;
}

declare module '#app' {
  interface NuxtApp {
    $clusterSocket: Socket;
    $eegDisplaySocket: Socket;
    $bciBridge?: BciBridgePluginApi;
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
  }
}

export {};
