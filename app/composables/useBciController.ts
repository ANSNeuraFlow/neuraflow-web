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

  /** SSVEP / 4-direction control: UP, DOWN, LEFT, RIGHT */
  const SSVEP_DIRECTION_ACTIONS = {
    up: 'UP_ACTION',
    down: 'DOWN_ACTION',
    left: 'LEFT_HAND',
    right: 'RIGHT_HAND',
  } as const satisfies Record<string, BciAction>;

  function onDirection(direction: keyof typeof SSVEP_DIRECTION_ACTIONS, callback: BciCommandHandler) {
    onCommand(SSVEP_DIRECTION_ACTIONS[direction], callback);
  }

  return {
    currentCommand,
    currentConfidence,
    isConnected,
    connectionError,
    onCommand,
    onDirection,
    SSVEP_DIRECTION_ACTIONS,
    reconnect: () => {
      if (import.meta.client) nuxtApp.$bciBridge?.reconnect();
    },
  };
};
