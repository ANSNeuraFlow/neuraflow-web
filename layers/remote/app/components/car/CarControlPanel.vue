<script setup lang="ts">
import { toRefs } from 'vue';

import { useBciController } from '~/composables/useBciController';

import { type CarDirection, useCarState } from '../../composables/useCarState';
import { useFlightPath } from '../../composables/useFlightPath';
import { useRcCarBridge } from '../../composables/useRcCarBridge';
import type { DroneTelemetryData } from '../../models/drone-control.domain';

const props = defineProps<{
  controlMode: 'bci' | 'manual';
}>();

const emit = defineEmits<{
  endSession: [];
}>();

const { t } = useI18n();

const car = useCarState();
const bridge = useRcCarBridge();
const flight = useFlightPath();
const { flightPath, isTracking } = toRefs(flight);

const mapTelemetry = reactive<DroneTelemetryData>({
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

const pressedDir = ref<CarDirection | null>(null);

const keyMap: Record<string, CarDirection> = {
  ArrowUp: 'forward',
  w: 'forward',
  W: 'forward',
  ArrowDown: 'backward',
  s: 'backward',
  S: 'backward',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
};

const handleKeydown = (e: KeyboardEvent) => {
  const dir = keyMap[e.key];
  if (!dir) return;
  e.preventDefault();
  if (!e.repeat) {
    pressedDir.value = dir;
    car.move(dir);
  }
};

const handleKeyup = (e: KeyboardEvent) => {
  const dir = keyMap[e.key];
  if (dir && pressedDir.value === dir) pressedDir.value = null;
};

const handleEndSession = () => {
  car.safeShutdown();
  emit('endSession');
};

const { onCommand } = useBciController();

if (props.controlMode === 'bci') {
  onCommand('LEFT_HAND', () => car.move('left'));
  onCommand('RIGHT_HAND', () => car.move('right'));
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keyup', handleKeyup);
  car.safeShutdown();
});

const arrowBtnClass = (dir: CarDirection) =>
  [
    'flex h-[5.6rem] w-[5.6rem] items-center justify-center rounded-xl border transition-all duration-100 select-none cursor-pointer',
    pressedDir.value === dir
      ? 'border-on-surface/30 bg-on-surface/20 text-on-surface scale-95'
      : 'border-on-surface/[0.12] bg-on-surface/[0.06] text-on-surface hover:bg-on-surface/[0.14] active:scale-95',
  ].join(' ');
</script>

<template>
  <div class="gap-x-lg flex flex-col">
    <div
      class="glass-card gap-md border-on-surface/[0.06] p-md sm:p-x-lg flex flex-wrap items-center justify-between border"
    >
      <div class="gap-xx-sm flex min-w-0 flex-col items-start">
        <div class="gap-sm flex flex-wrap items-center">
          <div class="relative flex h-[4rem] w-[4rem] shrink-0 items-center justify-center">
            <span
              v-if="bridge.isConnected.value"
              class="bg-success/25 absolute inset-0 animate-ping rounded-full"
            />
            <div
              :class="[
                'relative flex size-full items-center justify-center rounded-full',
                bridge.isConnected.value ? 'bg-success/10' : 'bg-on-surface/[0.06]',
              ]"
            >
              <Icon
                name="material-symbols:wifi"
                size="2rem"
                :class="bridge.isConnected.value ? 'text-success' : 'text-on-surface-dim'"
              />
            </div>
          </div>

          <AppStatusBadge
            class="shrink-0"
            :color="bridge.isConnected.value ? 'success' : 'default'"
            :label="
              bridge.isConnected.value
                ? t('remote.carControl.status.bridgeConnected')
                : t('remote.carControl.status.bridgeDisconnected')
            "
          />

          <AppStatusBadge
            class="shrink-0"
            :color="bridge.serialConnected.value ? 'success' : 'warning'"
            :label="
              bridge.serialConnected.value
                ? t('remote.carControl.status.serialConnected')
                : t('remote.carControl.status.serialDisconnected')
            "
          />

          <AppStatusBadge
            class="shrink-0"
            :color="controlMode === 'bci' ? 'success' : 'default'"
            :label="controlMode === 'bci' ? t('remote.carControl.modeBci') : t('remote.carControl.modeManual')"
          />

          <AppStatusBadge
            v-if="bridge.movementRunning.value && bridge.activeMovement.value"
            class="shrink-0"
            color="warning"
            :label="bridge.activeMovement.value"
          />
        </div>

        <div class="gap-sm mt-xx-sm flex flex-wrap items-center">
          <p class="text-body-md text-on-surface font-semibold leading-tight">
            {{ t('remote.control.vehicle.car') }}
          </p>
          <span class="text-body-x-sm text-on-surface-dim font-mono tabular-nums">
            {{ t('remote.carControl.status.throttle', { level: bridge.throttleLevel.value }) }}
          </span>
          <span class="text-body-x-sm text-on-surface-dim font-mono tabular-nums">
            {{ t('remote.carControl.status.steer', { level: bridge.steerLevel.value }) }}
          </span>
        </div>
      </div>

      <AppButton
        class="shrink-0"
        variant="destructive"
        size="sm"
        @click="handleEndSession"
      >
        <Icon
          name="material-symbols:stop-circle-outline"
          size="1.8rem"
          class="mr-xs"
        />
        {{ t('remote.control.endSession') }}
      </AppButton>
    </div>

    <div class="gap-x-lg gap-y-lg grid grid-cols-1 xl:grid-cols-[1fr_30rem]">
      <CarBciPanel />

      <div class="gap-md flex flex-col">
        <div class="glass-card gap-md p-md sm:p-x-lg flex flex-col">
          <div class="gap-sm flex items-center">
            <Icon
              name="material-symbols:directions-car-outline"
              size="1.8rem"
              class="text-on-surface-dim shrink-0"
            />
            <h2 class="text-heading-x-sm text-on-surface font-display font-bold">
              {{ t('remote.carControl.dpad.title') }}
            </h2>
          </div>

          <div class="flex flex-1 flex-col items-center justify-center">
            <div class="gap-sm grid grid-cols-3">
              <div />
              <button
                type="button"
                :class="arrowBtnClass('forward')"
                :aria-label="t('remote.carControl.dpad.forward')"
                @click="car.move('forward')"
              >
                <Icon
                  name="material-symbols:arrow-upward"
                  size="2.4rem"
                />
              </button>
              <div />

              <button
                type="button"
                :class="arrowBtnClass('left')"
                :aria-label="t('remote.carControl.dpad.left')"
                @click="car.move('left')"
              >
                <Icon
                  name="material-symbols:arrow-back"
                  size="2.4rem"
                />
              </button>

              <div class="flex h-[5.6rem] w-[5.6rem] items-center justify-center">
                <div class="border-on-surface/25 bg-on-surface/[0.12] h-[2rem] w-[2rem] rounded-full border" />
              </div>

              <button
                type="button"
                :class="arrowBtnClass('right')"
                :aria-label="t('remote.carControl.dpad.right')"
                @click="car.move('right')"
              >
                <Icon
                  name="material-symbols:arrow-forward"
                  size="2.4rem"
                />
              </button>

              <div />
              <button
                type="button"
                :class="arrowBtnClass('backward')"
                :aria-label="t('remote.carControl.dpad.backward')"
                @click="car.move('backward')"
              >
                <Icon
                  name="material-symbols:arrow-downward"
                  size="2.4rem"
                />
              </button>
              <div />
            </div>
          </div>

          <p class="gap-x-sm text-body-x-sm text-on-surface-dim/50 flex shrink-0 items-center">
            <Icon
              name="material-symbols:keyboard-outline"
              size="1.4rem"
            />
            {{ t('remote.droneControl.controls.keyboardHint') }}
          </p>
        </div>

        <CarMovementsPanel />
      </div>
    </div>

    <div class="gap-x-lg gap-y-lg grid grid-cols-1 xl:grid-cols-[1fr_minmax(0,30rem)]">
      <DroneMap
        compact
        class="h-full min-h-0 w-full min-w-0"
        :telemetry="mapTelemetry"
        :flight-path="flightPath"
        :is-tracking="isTracking"
      />

      <CarCommandLog
        :entries="car.commandLog.value"
        class="min-h-0 w-full min-w-0"
        @clear="car.clearLog"
      />
    </div>
  </div>
</template>
