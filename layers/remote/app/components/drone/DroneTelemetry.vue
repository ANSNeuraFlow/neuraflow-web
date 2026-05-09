<script setup lang="ts">
import type { DroneTelemetryData } from '../../models/drone-control.domain';

const props = defineProps<{
  telemetry: DroneTelemetryData;
}>();

const { t } = useI18n();

const batteryIconName = computed(() => {
  if (!props.telemetry.connected || props.telemetry.batteryPercent === null)
    return 'material-symbols:battery-unknown-outline';
  if (props.telemetry.batteryPercent > 80) return 'material-symbols:battery-full';
  if (props.telemetry.batteryPercent > 50) return 'material-symbols:battery-5-bar';
  if (props.telemetry.batteryPercent > 30) return 'material-symbols:battery-3-bar';
  if (props.telemetry.batteryPercent > 15) return 'material-symbols:battery-2-bar';
  return 'material-symbols:battery-alert';
});

const signalPercent = computed(() => {
  if (props.telemetry.signalStrength === null) return 0;
  return Math.max(0, Math.min(100, (props.telemetry.signalStrength + 100) * 2));
});

const signalColor = computed((): 'default' | 'success' | 'warning' | 'error' => {
  if (!props.telemetry.connected) return 'default';
  if (signalPercent.value > 60) return 'success';
  if (signalPercent.value > 30) return 'warning';
  return 'error';
});

const na = computed(() => t('remote.droneControl.telemetry.na'));

const formatGps = (lat: number | null, lon: number | null): string => {
  if (lat === null || lon === null) return na.value;
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}° ${latDir}  ${Math.abs(lon).toFixed(6)}° ${lonDir}`;
};
</script>

<template>
  <div class="glass-card p-md sm:p-x-lg gap-md flex flex-col">
    <div class="flex items-center justify-between">
      <div class="gap-x-sm flex items-center">
        <Icon
          name="material-symbols:monitoring"
          size="1.8rem"
          class="text-on-surface-dim shrink-0"
        />
        <h2 class="text-heading-x-sm text-on-surface font-display font-bold">
          {{ t('remote.droneControl.telemetry.title') }}
        </h2>
      </div>
      <AppStatusBadge
        :color="telemetry.connected ? 'success' : 'default'"
        :label="
          telemetry.connected
            ? t('remote.droneControl.telemetry.statusConnected')
            : t('remote.droneControl.telemetry.statusDisconnected')
        "
      />
    </div>

    <div class="gap-sm grid grid-cols-2">
      <div class="border-on-surface/[0.06] bg-on-surface/[0.03] gap-xx-sm p-sm flex flex-col rounded-xl border">
        <div class="gap-x-sm flex min-w-0 items-center">
          <Icon
            :name="batteryIconName"
            size="1.6rem"
            class="text-on-surface-dim shrink-0"
          />
          <span class="text-body-x-sm text-on-surface-dim truncate font-medium">
            {{ t('remote.droneControl.telemetry.battery') }}
          </span>
        </div>
        <p class="text-heading-sm text-on-surface font-display font-bold leading-none">
          {{ telemetry.batteryVoltage !== null ? `${telemetry.batteryVoltage.toFixed(1)} V` : na }}
        </p>
        <p class="text-body-x-sm text-on-surface-dim/50">
          {{ telemetry.batteryPercent !== null ? `${telemetry.batteryPercent}%` : '—%' }}
        </p>
      </div>

      <div class="border-on-surface/[0.06] bg-on-surface/[0.03] gap-xx-sm p-sm flex flex-col rounded-xl border">
        <div class="gap-x-sm flex min-w-0 items-center">
          <Icon
            name="material-symbols:altitude"
            size="1.6rem"
            class="text-on-surface-dim shrink-0"
          />
          <span class="text-body-x-sm text-on-surface-dim truncate font-medium">
            {{ t('remote.droneControl.telemetry.altitude') }}
          </span>
        </div>
        <p class="text-heading-sm text-on-surface font-display font-bold leading-none">
          {{ telemetry.altitude !== null ? `${telemetry.altitude.toFixed(1)} m` : na }}
        </p>
        <p class="text-body-x-sm text-on-surface-dim/50">AGL</p>
      </div>

      <div class="border-on-surface/[0.06] bg-on-surface/[0.03] gap-xx-sm p-sm flex flex-col rounded-xl border">
        <div class="gap-x-sm flex min-w-0 items-center">
          <Icon
            name="material-symbols:speed"
            size="1.6rem"
            class="text-on-surface-dim shrink-0"
          />
          <span class="text-body-x-sm text-on-surface-dim truncate font-medium">
            {{ t('remote.droneControl.telemetry.speed') }}
          </span>
        </div>
        <p class="text-heading-sm text-on-surface font-display font-bold leading-none">
          {{ telemetry.speed !== null ? `${telemetry.speed.toFixed(1)}` : na }}
        </p>
        <p class="text-body-x-sm text-on-surface-dim/50">m/s</p>
      </div>

      <div class="border-on-surface/[0.06] bg-on-surface/[0.03] gap-xx-sm p-sm flex flex-col rounded-xl border">
        <div class="gap-x-sm flex min-w-0 items-center">
          <Icon
            name="material-symbols:navigation"
            size="1.6rem"
            class="text-on-surface-dim shrink-0"
          />
          <span class="text-body-x-sm text-on-surface-dim truncate font-medium">
            {{ t('remote.droneControl.telemetry.heading') }}
          </span>
        </div>
        <p class="text-heading-sm text-on-surface font-display font-bold leading-none">
          {{ telemetry.heading !== null ? `${telemetry.heading}` : na }}
        </p>
        <p class="text-body-x-sm text-on-surface-dim/50">°</p>
      </div>

      <div class="border-on-surface/[0.06] bg-on-surface/[0.03] gap-xx-sm p-sm flex flex-col rounded-xl border">
        <div class="gap-x-sm flex min-w-0 items-center">
          <Icon
            name="material-symbols:straighten"
            size="1.6rem"
            class="text-on-surface-dim shrink-0"
          />
          <span class="text-body-x-sm text-on-surface-dim truncate font-medium">
            {{ t('remote.droneControl.telemetry.distanceFromHome') }}
          </span>
        </div>
        <p class="text-heading-sm text-on-surface font-display font-bold leading-none">
          {{ telemetry.distanceFromHome !== null ? `${telemetry.distanceFromHome.toFixed(0)}` : na }}
        </p>
        <p class="text-body-x-sm text-on-surface-dim/50">m</p>
      </div>

      <div class="border-on-surface/[0.06] bg-on-surface/[0.03] gap-sm p-sm flex flex-col rounded-xl border">
        <div class="gap-x-sm flex min-w-0 items-center justify-between">
          <div class="gap-x-sm flex min-w-0 items-center">
            <Icon
              name="material-symbols:signal-cellular-4-bar"
              size="1.6rem"
              class="text-on-surface-dim shrink-0"
            />
            <span class="text-body-x-sm text-on-surface-dim truncate font-medium">
              {{ t('remote.droneControl.telemetry.signal') }}
            </span>
          </div>
          <span class="text-body-x-sm text-on-surface shrink-0 font-semibold tabular-nums">
            {{ telemetry.signalStrength !== null ? `${telemetry.signalStrength}` : '—' }}
          </span>
        </div>
        <AppProgressBar
          :value="signalPercent"
          size="sm"
          :color="signalColor"
          :label="t('remote.droneControl.telemetry.signal')"
        />
        <p class="text-body-x-sm text-on-surface-dim/50">dBm</p>
      </div>

      <div
        class="border-on-surface/[0.06] bg-on-surface/[0.03] gap-xx-sm p-sm col-span-2 flex flex-col rounded-xl border"
      >
        <div class="gap-x-sm gap-y-xx-sm flex min-w-0 flex-wrap items-center">
          <Icon
            name="material-symbols:location-on-outline"
            size="1.6rem"
            class="text-on-surface-dim shrink-0"
          />
          <span class="text-body-x-sm text-on-surface-dim font-medium">
            {{ t('remote.droneControl.telemetry.gpsPosition') }}
          </span>
          <span
            v-if="telemetry.gpsLat === null"
            class="text-body-x-sm text-on-surface-dim/50 ml-auto"
          >
            {{ t('remote.droneControl.telemetry.gpsNoFix') }}
          </span>
        </div>
        <p class="text-body-sm text-on-surface font-mono font-semibold leading-snug">
          {{ formatGps(telemetry.gpsLat, telemetry.gpsLon) }}
        </p>
      </div>
    </div>
  </div>
</template>
