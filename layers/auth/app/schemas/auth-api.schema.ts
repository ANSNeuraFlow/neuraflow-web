import { z } from 'zod';

export const loginPasswordChangeRequiredSchema = z.object({
  message: z.literal('PASSWORD_CHANGE_REQUIRED'),
  email: z.email(),
});

export const loginSuccessSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    role: z.object({ id: z.uuid(), name: z.string() }).nullable(),
    isVerified: z.boolean(),
    isPasswordChangeRequired: z.boolean(),
  }),
});

export const loginApiResponseSchema = z.union([loginSuccessSchema, loginPasswordChangeRequiredSchema]);

export const registerApiResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  isVerified: z.boolean(),
  isPasswordChangeRequired: z.boolean(),
});

export const meApiResponseSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  role: z.object({ id: z.uuid(), name: z.string() }).nullable(),
  permissions: z.array(z.object({ name: z.string() })),
  createdAt: z.string(),
});
