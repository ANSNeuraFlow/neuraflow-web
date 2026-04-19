import { z } from 'zod';

const deploymentStatusEnum = z.enum(['PENDING', 'STARTING', 'RUNNING', 'STOPPING', 'STOPPED', 'FAILED']);

export const modelDeploymentDto = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  mlModelId: z.string().uuid(),
  status: deploymentStatusEnum,
  rayAppName: z.string().nullable(),
  serveEndpointUrl: z.string().nullable(),
  errorMessage: z.string().nullable(),
  startedAt: z.string().nullable(),
  stoppedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const modelDeploymentsListDto = z.array(modelDeploymentDto);
