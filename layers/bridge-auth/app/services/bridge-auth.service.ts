import { useApi } from '#layers/core/app/composables/useApi';

import { type BridgeAuthStartResponse, bridgeAuthStartResponseDto } from '../dtos/bridge-auth.dto';

export type BridgeAuthStartPayload = {
  clientId: string;
  redirectUri: string;
  state: string;
};

export const useBridgeAuthService = () => {
  const { post } = useApi();

  const start = async (payload: BridgeAuthStartPayload): Promise<BridgeAuthStartResponse> => {
    const response = await post<BridgeAuthStartResponse>('/bridge/auth/start', { body: payload });
    return bridgeAuthStartResponseDto.parse(response);
  };

  return { start };
};
