import { z } from 'zod';

const trainingJobStatusEnum = z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']);

export const trainingJobDto = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sessionIds: z.array(z.string().uuid()),
  rayJobId: z.string().nullable(),
  status: trainingJobStatusEnum,
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const trainingJobsListDto = z.array(trainingJobDto);
