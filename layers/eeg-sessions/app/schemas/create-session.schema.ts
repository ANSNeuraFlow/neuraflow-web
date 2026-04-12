import { z } from 'zod';

import { EEG_PROTOCOL_IDS } from '../constants/eeg-protocols.const';

export const createSessionSchema = z.object({
  deviceName: z
    .string()
    .min(1, 'eegSessions.validation.deviceNameRequired')
    .max(128, 'eegSessions.validation.deviceNameMax'),
  protocolName: z.enum(EEG_PROTOCOL_IDS, {
    message: 'eegSessions.validation.protocolRequired',
  }),
});

export type CreateSessionInput = z.input<typeof createSessionSchema>;
export type CreateSessionOutput = z.output<typeof createSessionSchema>;
