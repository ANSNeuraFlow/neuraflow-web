import { z } from 'zod';

export const adminUserDto = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  isVerified: z.boolean(),
  isPasswordChangeRequired: z.boolean(),
  lastLogin: z.string().nullable(),
  createdAt: z.string(),
  roleId: z.coerce.number().nullable(),
  role: z.string().nullable(),
});

export const adminUsersListDto = z.array(adminUserDto);

export const createAdminUserResponseDto = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  isVerified: z.boolean(),
  isPasswordChangeRequired: z.boolean(),
  roleId: z.coerce.number().nullable(),
});

export const updateUserRoleResponseDto = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  roleId: z.coerce.number().nullable(),
});
