export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  isPasswordChangeRequired: boolean;
  lastLogin: string | null;
  createdAt: string;
  roleId: number | null;
  role: string | null;
};

export type CreateAdminUserApiResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  isPasswordChangeRequired: boolean;
  roleId: number | null;
};

export type UpdateUserRoleApiResponse = {
  id: string;
  email: string;
  roleId: number | null;
};
