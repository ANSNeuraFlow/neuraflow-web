import { useRcCarBridge } from './useRcCarBridge';

export type CarDirection = 'forward' | 'backward' | 'left' | 'right';
export type CarCommand = `move_${CarDirection}` | 'cancel_movement' | 'neutral' | 'brake' | `run_movement:${string}`;

export interface CarCommandEntry {
  id: string;
  command: CarCommand;
  timestamp: Date;
}

export const BCI_MOVEMENT_IDS = {
  left: 'turn_and_brief_throttle_left',
  right: 'turn_and_brief_throttle_right',
} as const;

/** Bridge clamps to device bounds; values only need to exceed the typical range. */
const THROTTLE_FULL_FORWARD = 999;
const THROTTLE_OFF = 0;
const STEER_FULL_LEFT = -999;
const STEER_FULL_RIGHT = 999;

type ControlsSpec = {
  throttleLevel?: number;
  steerLevel?: number;
};

const DIRECTION_COMMANDS: Record<CarDirection, ControlsSpec> = {
  forward: { throttleLevel: THROTTLE_FULL_FORWARD },
  backward: { throttleLevel: THROTTLE_OFF },
  left: { steerLevel: STEER_FULL_LEFT },
  right: { steerLevel: STEER_FULL_RIGHT },
};

export function useCarState() {
  const bridge = useRcCarBridge();
  const commandLog = ref<CarCommandEntry[]>([]);

  const logCommand = (command: CarCommand) => {
    commandLog.value.unshift({
      id: crypto.randomUUID(),
      command,
      timestamp: new Date(),
    });
    if (commandLog.value.length > 100) {
      commandLog.value.length = 100;
    }
  };

  const clearLog = () => {
    commandLog.value = [];
  };

  const sendControls = (params: { throttleLevel?: number; steerLevel?: number }) => {
    const payload: Record<string, number> = {};
    if (params.throttleLevel !== undefined) payload.throttle_level = params.throttleLevel;
    if (params.steerLevel !== undefined) payload.steer_level = params.steerLevel;
    if (Object.keys(payload).length === 0) return;
    bridge.sendCommand('set_controls', payload);
  };

  const move = (direction: CarDirection) => {
    const spec = DIRECTION_COMMANDS[direction];
    logCommand(`move_${direction}`);
    sendControls({ throttleLevel: spec.throttleLevel, steerLevel: spec.steerLevel });
  };

  const releaseThrottle = () => {
    sendControls({ throttleLevel: THROTTLE_OFF });
  };

  const releaseSteer = () => {
    sendControls({ steerLevel: 0 });
  };

  const runMovement = (movementId: string) => {
    logCommand(`run_movement:${movementId}`);
    bridge.runMovement(movementId);
  };

  const cancelMovement = () => {
    logCommand('cancel_movement');
    bridge.cancelMovement();
  };

  const stop = () => {
    logCommand('neutral');
    bridge.neutral();
  };

  const safeShutdown = () => {
    if (bridge.movementRunning.value) {
      bridge.cancelMovement();
    }
    bridge.neutral();
  };

  return {
    commandLog,
    move,
    releaseThrottle,
    releaseSteer,
    runMovement,
    cancelMovement,
    stop,
    safeShutdown,
    clearLog,
  };
}
