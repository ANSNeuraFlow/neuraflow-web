import { z } from 'zod';

export const loginPasswordChangeRequiredDto = z.object({
  message: z.literal('PASSWORD_CHANGE_REQUIRED'),
  email: z.email(),
});

export const loginSuccessDto = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.object({ id: z.string().uuid(), name: z.string() }).nullable(),
    isVerified: z.boolean(),
    isPasswordChangeRequired: z.boolean(),
  }),
});

export const loginApiResponseDto = z.union([loginSuccessDto, loginPasswordChangeRequiredDto]);

export const registerApiResponseDto = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  isVerified: z.boolean(),
  isPasswordChangeRequired: z.boolean(),
});

export const meApiResponseDto = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.object({ id: z.string().uuid(), name: z.string() }).nullable(),
  permissions: z.array(z.object({ name: z.string() })),
  createdAt: z.string(),
});
