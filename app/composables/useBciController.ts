import { useNuxtApp, useState } from 'nuxt/app';
import { onUnmounted } from 'vue';

import type { BciAction, BciCommandHandler } from '../models/bci.domain';
import { BCI_STATE_KEYS } from '../models/bci.domain';

export const useBciController = () => {
  const nuxtApp = useNuxtApp();

  const currentCommand = useState<BciAction | null>(BCI_STATE_KEYS.command, () => null);
  const currentConfidence = useState<number>(BCI_STATE_KEYS.confidence, () => 0);
  const isConnected = useState<boolean>(BCI_STATE_KEYS.connected, () => false);
  const connectionError = useState<string | null>(BCI_STATE_KEYS.error, () => null);

  function onCommand(action: BciAction, callback: BciCommandHandler) {
    if (import.meta.server) return;
    const off = nuxtApp.$bciBridge?.subscribePayload((payload) => {
      if (payload.command === action) {
        callback(payload.confidence);
      }
    });
    if (off) onUnmounted(off);
  }

  return {
    currentCommand,
    currentConfidence,
    isConnected,
    connectionError,
    onCommand,
    reconnect: () => {
      if (import.meta.client) nuxtApp.$bciBridge?.reconnect();
    },
  };
};
