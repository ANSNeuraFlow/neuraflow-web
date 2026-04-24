import { z } from 'zod';

const profileStatsDto = z.object({
  eegSessionCount: z.number().int().nonnegative(),
  trainingJobCount: z.number().int().nonnegative(),
  modelDeploymentCount: z.number().int().nonnegative(),
  mlModelCount: z.number().int().nonnegative(),
});

export const userProfileDto = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  bio: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  isVerified: z.boolean(),
  lastLogin: z.string().nullable(),
  createdAt: z.string(),
  role: z.object({ id: z.coerce.number().int().positive(), name: z.string() }).nullable(),
  permissions: z.array(z.string()),
  stats: profileStatsDto,
});

export const updateProfileResponseDto = userProfileDto;
