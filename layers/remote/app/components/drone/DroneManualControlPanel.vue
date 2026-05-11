<script setup lang="ts">
import { toRefs } from 'vue';

import { useDroneState } from '../../composables/useDroneState';
import { useFlightPath } from '../../composables/useFlightPath';

const emit = defineEmits<{
  endSession: [];
}>();

const drone = useDroneState();
const flight = useFlightPath();
const { flightPath, isTracking } = toRefs(flight);

watch(drone.isFlying, (flying) => {
  if (flying) {
    flight.startTracking();
    flight.addPoint(drone.telemetry);
  } else {
    flight.stopTracking();
  }
});

watch(
  () => ({
    gpsLat: drone.telemetry.gpsLat,
    gpsLon: drone.telemetry.gpsLon,
  }),
  () => flight.addPoint(drone.telemetry),
);
</script>

<template>
  <div class="gap-x-lg flex flex-col">
    <DroneSessionBar @end-session="emit('endSession')" />

    <div class="gap-x-lg gap-y-lg grid grid-cols-1 xl:grid-cols-[1fr_30rem]">
      <DroneCameraFeed />
      <DroneTelemetry :telemetry="drone.telemetry" />
    </div>

    <!--
      Poniżej xl: kolejka karta kierunku+zasilanie → map+log obok siebie → HUD na końcu.
      Od xl: rząd 2 — mapa na szerokość kierunku+zasilanie (col-span 2), dziennik w kolumnie HUD pod nim.
    -->
    <div
      class="gap-x-lg gap-y-lg xl:gap-x-lg grid min-h-0 grid-cols-1 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,1.3fr)] xl:grid-rows-[auto_minmax(0,1fr)] xl:items-stretch"
    >
      <div class="gap-x-lg gap-y-lg grid min-h-0 grid-cols-1 md:grid-cols-2 md:items-stretch xl:contents">
        <DroneDpad
          class="h-full min-h-0 w-full xl:col-start-1 xl:row-start-1 xl:min-h-[25rem]"
          :disabled="!drone.isArmed.value"
          @move="drone.move"
        />
        <DronePowerControls
          class="h-full min-h-0 w-full xl:col-start-2 xl:row-start-1 xl:min-h-[25rem]"
          :is-armed="drone.isArmed.value"
          :is-flying="drone.isFlying.value"
          @arm="drone.arm"
          @disarm="drone.disarm"
          @takeoff="drone.takeoff"
          @land="drone.land"
        />
      </div>

      <div
        class="gap-x-lg gap-y-lg grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2 md:items-stretch xl:contents xl:flex-none"
      >
        <DroneMap
          compact
          class="h-full min-h-0 w-full min-w-0 xl:col-span-2 xl:col-start-1 xl:row-start-2"
          :telemetry="drone.telemetry"
          :flight-path="flightPath"
          :is-tracking="isTracking"
        />
        <DroneCommandLog
          :entries="drone.commandLog.value"
          class="h-full min-h-0 w-full min-w-0 xl:col-start-3 xl:row-start-2"
          @clear="drone.clearLog"
        />
      </div>

      <DroneHUD
        compact
        class="h-full min-h-0 w-full xl:col-start-3 xl:row-start-1 xl:min-h-[25rem]"
        :pitch="drone.telemetry.pitch ?? 0"
        :roll="drone.telemetry.roll ?? 0"
        :heading="drone.telemetry.heading ?? 0"
        :airspeed="drone.telemetry.speed ?? 0"
        :altitude="drone.telemetry.altitude ?? 0"
        :battery-voltage="drone.telemetry.batteryVoltage ?? 0"
        :battery-percent="drone.telemetry.batteryPercent ?? 0"
      />
    </div>
  </div>
</template>
