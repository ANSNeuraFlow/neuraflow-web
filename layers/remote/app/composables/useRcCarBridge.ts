import { computed } from 'vue';

import type { RcCarBridgeCommand } from '../models/rc-car-bridge.domain';

export const useRcCarBridge = () => {
  const nuxtApp = useNuxtApp();
  const bridge = nuxtApp.$rcCarBridge;

  const isConnected = computed(() => bridge?.isConnected.value ?? false);
  const connectionError = computed(() => bridge?.connectionError.value ?? null);
  const status = computed(() => bridge?.status.value ?? null);
  const movements = computed(() => bridge?.movements.value ?? []);

  const serialConnected = computed(() => status.value?.serialConnected ?? false);
  const throttleLevel = computed(() => status.value?.throttleLevel ?? 0);
  const steerLevel = computed(() => status.value?.steerLevel ?? 0);
  const activeMovement = computed(() => status.value?.activeMovement ?? '');
  const movementRunning = computed(() => status.value?.movementRunning ?? false);

  const sendCommand = (command: RcCarBridgeCommand, params: Record<string, unknown> = {}) =>
    bridge?.sendCommand(command, params) ?? false;

  const runMovement = (movementId: string) => sendCommand('run_movement', { movement_id: movementId });

  const cancelMovement = () => sendCommand('cancel_movement');

  const neutral = () => sendCommand('neutral');

  const reconnect = () => {
    if (import.meta.client) bridge?.reconnect();
  };

  return {
    isConnected,
    connectionError,
    status,
    movements,
    serialConnected,
    throttleLevel,
    steerLevel,
    activeMovement,
    movementRunning,
    sendCommand,
    runMovement,
    cancelMovement,
    neutral,
    reconnect,
  };
};
