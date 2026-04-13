import { z } from 'zod';

const modelStatusEnum = z.enum(['PENDING', 'TRAINING', 'READY', 'FAILED']);

export const mlModelDto = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  trainingJobId: z.string().uuid(),
  sessionId: z.string().uuid(),
  name: z.string(),
  status: modelStatusEnum,
  accuracy: z.number().nullable(),
  filePath: z.string().nullable(),
  fileSize: z.number().nullable(),
  trainedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const mlModelsListDto = z.array(mlModelDto);
