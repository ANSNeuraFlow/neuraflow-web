export type CarCommand = 'move_forward' | 'move_backward' | 'move_left' | 'move_right';
export type CarDirection = 'forward' | 'backward' | 'left' | 'right';

export interface CarCommandEntry {
  id: string;
  command: CarCommand;
  timestamp: Date;
}

export function useCarState() {
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
    logCommand(`move_${direction}` as CarCommand);
  };

  return {
    commandLog,
    move,
    clearLog,
  };
}
