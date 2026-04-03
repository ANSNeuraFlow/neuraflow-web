import { z } from 'zod';

export const updateRoleSchema = z.object({
  roleId: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return undefined;
      if (typeof value === 'string') return Number(value);
      return value;
    },
    z
      .number({ error: 'admin.validation.roleRequired' })
      .int('admin.validation.roleRequired')
      .positive('admin.validation.roleRequired'),
  ),
});

export type UpdateRoleInput = z.input<typeof updateRoleSchema>;
export type UpdateRoleOutput = z.output<typeof updateRoleSchema>;
