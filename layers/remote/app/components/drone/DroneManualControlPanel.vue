<script setup lang="ts">
import { useDroneState } from '../../composables/useDroneState';

const emit = defineEmits<{
  endSession: [];
}>();

const drone = useDroneState();
</script>

<template>
  <div class="gap-x-lg flex flex-col">
    <DroneSessionBar @end-session="emit('endSession')" />
    <div class="gap-x-lg gap-y-lg grid grid-cols-1 xl:grid-cols-[1fr_30rem]">
      <DroneCameraFeed />
      <DroneTelemetry :telemetry="drone.telemetry" />
    </div>
    <div
      class="gap-x-lg gap-y-lg grid min-h-0 auto-rows-[minmax(0,auto)] grid-cols-1 items-stretch overflow-hidden md:grid-cols-2 xl:grid-cols-[auto_1fr_1fr]"
    >
      <DroneDpad
        class="h-full min-h-0 w-full"
        :disabled="!drone.isArmed.value"
        @move="drone.move"
      />
      <DronePowerControls
        class="h-full min-h-0 w-full"
        :is-armed="drone.isArmed.value"
        :is-flying="drone.isFlying.value"
        @arm="drone.arm"
        @disarm="drone.disarm"
        @takeoff="drone.takeoff"
        @land="drone.land"
      />
      <DroneCommandLog
        :entries="drone.commandLog.value"
        class="h-full min-h-0 w-full md:col-span-2 xl:col-span-1"
        @clear="drone.clearLog"
      />
    </div>
  </div>
</template>
