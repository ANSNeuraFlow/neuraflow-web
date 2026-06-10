import { useRcCarBridge } from './useRcCarBridge';

export type CarDirection = 'forward' | 'backward' | 'left' | 'right';
export type CarCommand = `move_${CarDirection}` | 'cancel_movement' | 'neutral' | 'brake' | `run_movement:${string}`;

export interface CarCommandEntry {
  id: string;
  command: CarCommand;
  timestamp: Date;
}

const DIRECTION_COMMANDS: Record<CarDirection, { command: 'throttle_step' | 'steer_step'; delta: number }> = {
  forward: { command: 'throttle_step', delta: 1 },
  backward: { command: 'throttle_step', delta: -1 },
  left: { command: 'steer_step', delta: -1 },
  right: { command: 'steer_step', delta: 1 },
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

  const move = (direction: CarDirection) => {
    const spec = DIRECTION_COMMANDS[direction];
    logCommand(`move_${direction}`);
    bridge.sendCommand(spec.command, { delta: spec.delta });
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
    runMovement,
    cancelMovement,
    stop,
    safeShutdown,
    clearLog,
  };
}
