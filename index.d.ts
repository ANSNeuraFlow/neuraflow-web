import type { Socket } from 'socket.io-client';

import type { Permission } from './layers/auth/app/models/user.domain';

declare module '#app' {
  interface NuxtApp {
    $clusterSocket: Socket;
    $eegDisplaySocket: Socket;
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
  }
}

export {};
