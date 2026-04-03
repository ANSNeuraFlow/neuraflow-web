import { useApi } from '#layers/core/app/composables/useApi';

import { adminUsersListDto, createAdminUserResponseDto, updateUserRoleResponseDto } from '../dtos/admin.dto';
import type { AdminUser, CreateAdminUserApiResponse, UpdateUserRoleApiResponse } from '../models/admin-api.domain';

export type CreateUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
  roleId?: number;
};

export type UpdateUserRolePayload = {
  roleId: number;
};

export const useAdminService = () => {
  const { get, post, patch, delete: deleteFn } = useApi();

  const getUsers = async (): Promise<AdminUser[]> => {
    const response = await get<AdminUser[]>('/admin/users');
    return adminUsersListDto.parse(response);
  };

  const createUser = async (payload: CreateUserPayload): Promise<CreateAdminUserApiResponse> => {
    const response = await post<CreateAdminUserApiResponse>('/admin/users', {
      body: payload,
    });
    return createAdminUserResponseDto.parse(response);
  };

  const updateUserRole = async (userId: string, payload: UpdateUserRolePayload): Promise<UpdateUserRoleApiResponse> => {
    const response = await patch<UpdateUserRoleApiResponse>(`/admin/users/${userId}/role`, {
      body: payload,
    });
    return updateUserRoleResponseDto.parse(response);
  };

  const deleteUser = async (userId: string): Promise<void> => {
    await deleteFn(`/admin/users/${userId}`);
  };

  return {
    getUsers,
    createUser,
    updateUserRole,
    deleteUser,
  };
};
