import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'auth.validation.firstNameMin').max(64),
    lastName: z.string().min(2, 'auth.validation.lastNameMin').max(64),
    email: z.string().min(1, 'auth.validation.emailRequired').email('auth.validation.emailInvalid'),
    password: z.string().min(8, 'auth.validation.passwordMinLength').max(128),
    confirmPassword: z.string().min(1, 'auth.validation.confirmRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.validation.passwordsMustMatch',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterOutput = z.output<typeof registerSchema>;
