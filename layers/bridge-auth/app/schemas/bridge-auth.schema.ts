import { z } from 'zod';

export const bridgeAuthQuerySchema = z.object({
  clientId: z.string().min(1, 'bridgeAuth.validation.clientIdRequired').max(64),
  redirectUri: z.string().regex(/^http:\/\/localhost:\d{1,5}\/callback$/, 'bridgeAuth.validation.invalidRedirect'),
  state: z.string().min(1, 'bridgeAuth.validation.stateRequired').max(256),
});

export type BridgeAuthQuery = z.infer<typeof bridgeAuthQuerySchema>;
