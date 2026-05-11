<script setup lang="ts">
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet';
import L from 'leaflet';

import type { FlightPathPoint } from '../../composables/useFlightPath';
import { DEFAULT_MAP_CENTER } from '../../composables/useFlightPath';
import type { DroneTelemetryData } from '../../models/drone-control.domain';

const props = defineProps<{
  telemetry: DroneTelemetryData;
  flightPath: FlightPathPoint[];
  isTracking: boolean;
}>();

const { t } = useI18n();

const mapEl = ref<HTMLDivElement | null>(null);
const autoFollow = ref(true);

let mapInstance: LeafletMap | null = null;
let droneMarker: Marker | null = null;
let flightPolyline: Polyline | null = null;
let resizeObserver: ResizeObserver | null = null;

const currentLat = computed(() => props.telemetry.gpsLat ?? DEFAULT_MAP_CENTER.lat);
const currentLng = computed(() => props.telemetry.gpsLon ?? DEFAULT_MAP_CENTER.lng);
const hasGpsFix = computed(() => props.telemetry.gpsLat !== null && props.telemetry.gpsLon !== null);

function buildDroneIconHtml(heading: number | null): string {
  const rotation = heading ?? 0;
  return `<div style="transform:rotate(${rotation}deg);width:36px;height:36px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 6px rgb(0 0 0 / 0.55))">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
<line x1="7" y1="7" x2="18" y2="18" stroke="rgb(255 255 255 / 0.92)" stroke-width="2.5" stroke-linecap="round"/>
<line x1="29" y1="7" x2="18" y2="18" stroke="rgb(255 255 255 / 0.92)" stroke-width="2.5" stroke-linecap="round"/>
<line x1="7" y1="29" x2="18" y2="18" stroke="rgb(255 255 255 / 0.92)" stroke-width="2.5" stroke-linecap="round"/>
<line x1="29" y1="29" x2="18" y2="18" stroke="rgb(255 255 255 / 0.92)" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="7" cy="7" r="5" fill="#6366f1" stroke="rgb(255 255 255 / 0.95)" stroke-width="1.5"/>
<circle cx="29" cy="7" r="5" fill="#6366f1" stroke="rgb(255 255 255 / 0.95)" stroke-width="1.5"/>
<circle cx="7" cy="29" r="5" fill="#6366f1" stroke="rgb(255 255 255 / 0.95)" stroke-width="1.5"/>
<circle cx="29" cy="29" r="5" fill="#6366f1" stroke="rgb(255 255 255 / 0.95)" stroke-width="1.5"/>
<circle cx="18" cy="18" r="4.5" fill="#6366f1" stroke="rgb(255 255 255 / 0.95)" stroke-width="1.5"/>
<polygon points="18,8 15.5,14.5 20.5,14.5" fill="white" opacity="0.95"/>
</svg></div>`;
}

function makeDroneIcon(heading: number | null) {
  return L.divIcon({
    html: buildDroneIconHtml(heading),
    className: 'drone-map-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function updateMarkerPosition() {
  if (!mapInstance || !droneMarker) return;
  const lat = props.telemetry.gpsLat ?? DEFAULT_MAP_CENTER.lat;
  const lng = props.telemetry.gpsLon ?? DEFAULT_MAP_CENTER.lng;
  droneMarker.setLatLng([lat, lng]);
  droneMarker.setIcon(makeDroneIcon(props.telemetry.heading));
  if (autoFollow.value) {
    mapInstance.setView([lat, lng], mapInstance.getZoom(), { animate: true });
  }
}

function refreshPolyline() {
  flightPolyline?.setLatLngs(props.flightPath.map((p): [number, number] => [p.lat, p.lng]));
}

onMounted(() => {
  if (!mapEl.value) return;

  mapInstance = L.map(mapEl.value, {
    center: [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng],
    zoom: 15,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapInstance);

  droneMarker = L.marker([currentLat.value, currentLng.value], {
    icon: makeDroneIcon(props.telemetry.heading),
    zIndexOffset: 1000,
  }).addTo(mapInstance);

  flightPolyline = L.polyline(
    props.flightPath.map((p): [number, number] => [p.lat, p.lng]),
    { color: '#6366f1', weight: 3, opacity: 0.82, smoothFactor: 1.35 },
  ).addTo(mapInstance);

  resizeObserver = new ResizeObserver(() => {
    mapInstance?.invalidateSize();
  });
  resizeObserver.observe(mapEl.value);

  void nextTick(() => {
    mapInstance?.invalidateSize();
    updateMarkerPosition();
    refreshPolyline();
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  flightPolyline?.remove();
  droneMarker?.remove();
  mapInstance?.remove();
  flightPolyline = null;
  droneMarker = null;
  mapInstance = null;
});

watch(() => [props.telemetry.gpsLat, props.telemetry.gpsLon, props.telemetry.heading] as const, updateMarkerPosition);

watch(autoFollow, () => {
  if (autoFollow.value) updateMarkerPosition();
});

watch(() => props.flightPath, refreshPolyline, { deep: true });
</script>

<template>
  <div class="glass-card overflow-hidden">
    <div class="border-on-surface/[0.08] px-md py-sm flex items-center justify-between border-b">
      <div class="gap-sm flex min-w-0 flex-1 flex-wrap items-center">
        <Icon
          name="material-symbols:map-outline"
          size="1.8rem"
          class="text-on-surface-dim shrink-0"
        />
        <span class="text-body-sm text-on-surface truncate font-medium">
          {{ t('remote.droneControl.map.title') }}
        </span>
        <span
          v-if="isTracking"
          class="bg-success/10 text-success text-body-x-sm px-sm shrink-0 rounded-full py-[0.2rem] font-medium"
        >
          {{ t('remote.droneControl.map.recording') }}
        </span>
      </div>

      <div class="gap-sm ml-sm flex shrink-0 items-center">
        <AppStatusBadge
          :color="hasGpsFix ? 'success' : 'default'"
          :label="hasGpsFix ? t('remote.droneControl.map.gpsFix') : t('remote.droneControl.map.noFix')"
        />
        <button
          type="button"
          :class="[
            'text-body-x-sm duration-short gap-xx-sm px-sm py-xx-sm inline-flex shrink-0 items-center rounded-lg border font-medium transition-colors',
            autoFollow
              ? 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20'
              : 'border-on-surface/[0.08] text-on-surface-dim hover:bg-on-surface/[0.06] hover:text-on-surface',
          ]"
          :aria-pressed="autoFollow"
          :aria-label="t('remote.droneControl.map.toggleFollow')"
          @click="autoFollow = !autoFollow"
        >
          <Icon
            name="material-symbols:my-location"
            size="1.4rem"
            class="shrink-0"
          />
          {{ t('remote.droneControl.map.follow') }}
        </button>
      </div>
    </div>

    <div
      ref="mapEl"
      class="relative h-[24rem] w-full sm:h-[28rem]"
      :aria-label="t('remote.droneControl.map.ariaLabel')"
    />
  </div>
</template>

<style>
@import url('leaflet/dist/leaflet.css');

.drone-map-icon {
  background: transparent !important;
  border: none !important;
}

html[data-theme='dark'] .leaflet-tile-pane {
  filter: invert(100%) hue-rotate(180deg) brightness(0.75) contrast(1.1) saturate(0.8);
}

html[data-theme='dark'] .leaflet-control-attribution {
  background: rgb(11 13 17 / 85%) !important;
  color: rgb(179 179 179 / 90%) !important;
}

html[data-theme='dark'] .leaflet-control-attribution a {
  color: rgb(179 179 179 / 90%) !important;
}

html[data-theme='dark'] .leaflet-control-zoom a {
  background: rgb(20 24 29 / 92%) !important;
  color: rgb(255 255 255 / 85%) !important;
  border-color: rgb(255 255 255 / 8%) !important;
}

html[data-theme='dark'] .leaflet-control-zoom a:hover {
  background: rgb(30 35 45 / 98%) !important;
  color: rgb(255 255 255) !important;
}
</style>
