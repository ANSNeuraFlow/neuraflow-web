import type {
  DroneCommand,
  DroneCommandEntry,
  DroneDirection,
  DroneTelemetryData,
} from '../models/drone-control.domain';

export type { DroneCommand, DroneCommandEntry, DroneDirection, DroneTelemetryData };

export function useDroneState() {
  const { $mavlinkBridge } = useNuxtApp();

  const isArmed = ref(false);
  const isFlying = ref(false);

  const telemetry = reactive<DroneTelemetryData>({
    batteryVoltage: null,
    batteryPercent: null,
    altitude: null,
    speed: null,
    pitch: null,
    roll: null,
    heading: null,
    signalStrength: null,
    gpsLat: null,
    gpsLon: null,
    distanceFromHome: null,
    connected: false,
  });

  const commandLog = ref<DroneCommandEntry[]>([]);

  const logCommand = (command: DroneCommand, ack?: { success: boolean; result: string }) => {
    const entry: DroneCommandEntry = {
      id: crypto.randomUUID(),
      command,
      timestamp: new Date(),
    };
    if (ack) {
      entry.ackSuccess = ack.success;
      entry.ackResult = ack.result;
    }
    commandLog.value.unshift(entry);
    if (commandLog.value.length > 100) {
      commandLog.value.length = 100;
    }
  };

  const clearLog = () => {
    commandLog.value = [];
  };

  const send = (command: DroneCommand, params?: Record<string, unknown>) => {
    logCommand(command);
    $mavlinkBridge.sendCommand(command, params);
  };

  const arm = () => {
    if (isArmed.value) return;
    send('arm');
  };

  const disarm = () => {
    send('disarm');
  };

  const takeoff = () => {
    if (!isArmed.value || isFlying.value) return;
    send('takeoff', { altitude: 5 });
  };

  const land = () => {
    if (!isFlying.value) return;
    send('land');
  };

  const move = (direction: DroneDirection) => {
    if (!isArmed.value) return;
    send(`move_${direction}` as DroneCommand);
  };

  let unsubTelemetry: (() => void) | undefined;
  let unsubStatus: (() => void) | undefined;
  let unsubAck: (() => void) | undefined;

  onMounted(() => {
    unsubTelemetry = $mavlinkBridge.onTelemetry((msg) => {
      Object.assign(telemetry, msg.data);
    });

    unsubStatus = $mavlinkBridge.onStatus((msg) => {
      telemetry.connected = msg.connected;
      isArmed.value = msg.armed;
      isFlying.value = Boolean(msg.airborne);
    });

    unsubAck = $mavlinkBridge.onCommandAck((msg) => {
      const cmd = msg.command as DroneCommand;
      const head = commandLog.value[0];
      if (head && head.command === cmd) {
        head.ackSuccess = msg.success;
        head.ackResult = msg.result;
      } else {
        logCommand(cmd, { success: msg.success, result: msg.result });
      }
    });
  });

  onBeforeUnmount(() => {
    unsubTelemetry?.();
    unsubStatus?.();
    unsubAck?.();
  });

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
