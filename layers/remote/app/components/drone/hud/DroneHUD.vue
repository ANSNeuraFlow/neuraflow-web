<script setup lang="ts">
// Główny HUD lotu — składa podkomponenty z folderu hud/ i zestawia układ karty (glass-card).
// Wartości domyślne umożliwują podgląd bez źródła danych; w locie nadpiszesz je przez propsy z telemetrii.
const props = withDefaults(
  defineProps<{
    pitch: number;
    roll: number;
    heading: number;
    airspeed: number;
    altitude: number;
    batteryVoltage: number;
    batteryPercent: number;
    /** Wąska kolumna obok sterowania — niższy horyzont i węższe taśmy. */
    compact?: boolean;
  }>(),
  {
    pitch: 2.4,
    roll: -8.5,
    heading: 127,
    airspeed: 12.4,
    altitude: 48.2,
    batteryVoltage: 16.09,
    batteryPercent: 85,
    compact: false,
  },
);

const horizonRowClass = computed(() => (props.compact ? 'h-[17rem] sm:h-[18rem]' : 'h-[24rem]'));

const { t } = useI18n();
</script>

<template>
  <div class="glass-card flex h-full min-h-0 flex-col overflow-hidden">
    <div class="px-md py-sm gap-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div class="gap-sm flex min-w-0 items-center">
        <Icon
          name="material-symbols:flight"
          size="1.8rem"
          class="text-on-surface-dim shrink-0"
        />
        <h2 class="text-heading-x-sm text-on-surface truncate font-display font-bold">
          {{ t('remote.droneControl.hud.title') }}
        </h2>
      </div>

      <DroneHUDBatteryIndicator
        :voltage="props.batteryVoltage"
        :percent="props.batteryPercent"
      />
    </div>

    <div class="p-md gap-md flex min-h-0 flex-1 flex-col">
      <DroneHUDCompass :heading="props.heading" />

      <div :class="['gap-sm flex items-stretch', horizonRowClass]">
        <DroneHUDVerticalTape
          :narrow="props.compact"
          :value="props.airspeed"
          label="IAS"
          unit="m/s"
          :px-per-unit="10"
          :tick-step="1"
          :major-every="5"
          :window-size="14"
          pointer-side="right"
        />

        <DroneHUDArtificialHorizon
          :pitch="props.pitch"
          :roll="props.roll"
        />

        <DroneHUDVerticalTape
          :narrow="props.compact"
          :value="props.altitude"
          label="ALT"
          unit="m"
          :px-per-unit="2"
          :tick-step="5"
          :major-every="2"
          :window-size="14"
          pointer-side="left"
        />
      </div>
    </div>
  </div>
</template>
