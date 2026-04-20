import { z } from 'zod';

export const bridgeAuthStartResponseDto = z.object({
  code: z.string().min(32),
  state: z.string(),
  redirectUri: z.string(),
});

export type BridgeAuthStartResponse = z.infer<typeof bridgeAuthStartResponseDto>;
