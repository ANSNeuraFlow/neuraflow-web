import { z } from 'zod';

const sessionStatusEnum = z.enum(['INITIALIZED', 'ACTIVE', 'COMPLETED', 'FAILED']);

export const eegSessionDto = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sessionName: z.string(),
  protocolName: z.string(),
  status: sessionStatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
  startedAt: z.string().nullable(),
  endedAt: z.string().nullable(),
});

export const eegSessionsListDto = z.array(eegSessionDto);
