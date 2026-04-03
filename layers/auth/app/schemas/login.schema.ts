import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'auth.validation.emailRequired').email('auth.validation.emailInvalid'),
  password: z.string().min(1, 'auth.validation.passwordRequired').min(8, 'auth.validation.passwordMinLength'),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginOutput = z.output<typeof loginSchema>;
