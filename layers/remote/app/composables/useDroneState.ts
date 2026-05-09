import type {
  DroneCommand,
  DroneCommandEntry,
  DroneDirection,
  DroneTelemetryData,
} from '../models/drone-control.domain';

export type { DroneCommand, DroneCommandEntry, DroneDirection, DroneTelemetryData };

export function useDroneState() {
  const isArmed = ref(false);
  const isFlying = ref(false);

  const telemetry = reactive<DroneTelemetryData>({
    batteryVoltage: null,
    batteryPercent: null,
    altitude: null,
    speed: null,
    heading: null,
    signalStrength: null,
    gpsLat: null,
    gpsLon: null,
    distanceFromHome: null,
    connected: false,
  });

  const commandLog = ref<DroneCommandEntry[]>([]);

  const logCommand = (command: DroneCommand) => {
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

  const arm = () => {
    if (isArmed.value) return;
    isArmed.value = true;
    logCommand('arm');
  };

  const disarm = () => {
    isArmed.value = false;
    isFlying.value = false;
    logCommand('disarm');
  };

  const takeoff = () => {
    if (!isArmed.value || isFlying.value) return;
    isFlying.value = true;
    logCommand('takeoff');
  };

  const land = () => {
    if (!isFlying.value) return;
    isFlying.value = false;
    logCommand('land');
  };

  const move = (direction: DroneDirection) => {
    if (!isArmed.value) return;
    logCommand(`move_${direction}` as DroneCommand);
  };

  return {
    isArmed,
    isFlying,
    telemetry,
    commandLog,
    arm,
    disarm,
    takeoff,
    land,
    move,
    clearLog,
  };
}
