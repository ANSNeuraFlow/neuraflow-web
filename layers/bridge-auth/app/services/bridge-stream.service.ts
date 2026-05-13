import { useApi } from '#layers/core/app/composables/useApi';

export interface BridgeStatus {
  controlConnected: boolean;
  streamConnected: boolean;
  streaming: boolean;
}

export interface BridgeControlCommandResponse {
  ok: boolean;
  sent: number;
}

export const useBridgeStreamService = () => {
  const { get, post } = useApi();

  const getStatus = () => get<BridgeStatus>('/bridge/control/status');

  const sendCommand = (action: 'start_streaming' | 'stop_streaming') =>
    post<BridgeControlCommandResponse>('/bridge/control/command', { body: { action } });

  const sendMarker = (marker: string) =>
    post<BridgeControlCommandResponse>('/bridge/control/marker', { body: { marker } });

  return { getStatus, sendCommand, sendMarker };
};
