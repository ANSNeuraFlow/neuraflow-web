import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().min(1, 'admin.validation.emailRequired').email('admin.validation.emailInvalid'),
  firstName: z.string().min(2, 'admin.validation.firstNameMin').max(64, 'admin.validation.firstNameMax'),
  lastName: z.string().min(2, 'admin.validation.lastNameMin').max(64, 'admin.validation.lastNameMax'),
  temporaryPassword: z.string().min(8, 'admin.validation.passwordMin').max(128, 'admin.validation.passwordMax'),
  roleId: z.coerce.number().int().positive().optional(),
});

export type CreateUserInput = z.input<typeof createUserSchema>;
export type CreateUserOutput = z.output<typeof createUserSchema>;
