import type { DroneTelemetryData } from '../models/drone-control.domain';

export interface FlightPathPoint {
  lat: number;
  lng: number;
}

export const DEFAULT_MAP_CENTER: FlightPathPoint = {
  lat: 49.609052021789985,
  lng: 20.70416715166484,
};

export function useFlightPath() {
  const isTracking = ref(false);
  const flightPath = ref<FlightPathPoint[]>([]);

  const currentPosition = computed(() => flightPath.value.at(-1) ?? null);

  const startTracking = () => {
    isTracking.value = true;
  };

  const stopTracking = () => {
    isTracking.value = false;
  };

  const addPoint = (telemetry: Pick<DroneTelemetryData, 'gpsLat' | 'gpsLon'>) => {
    if (!isTracking.value) return;
    if (telemetry.gpsLat === null || telemetry.gpsLon === null) return;
    const last = flightPath.value.at(-1);
    if (last && last.lat === telemetry.gpsLat && last.lng === telemetry.gpsLon) return;
    flightPath.value.push({ lat: telemetry.gpsLat, lng: telemetry.gpsLon });
  };

  const resetPath = () => {
    flightPath.value = [];
  };

  return {
    isTracking,
    flightPath,
    currentPosition,
    startTracking,
    stopTracking,
    addPoint,
    resetPath,
  };
}
