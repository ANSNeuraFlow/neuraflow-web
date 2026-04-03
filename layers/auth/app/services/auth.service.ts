import { useApi } from '#layers/core/app/composables/useApi';

import type {
  LoginApiResponse,
  LoginPasswordChangeRequiredResponse,
  MeApiResponse,
  RegisterApiResponse,
} from '../models/auth-api.domain';
import { loginApiResponseSchema, meApiResponseSchema, registerApiResponseSchema } from '../schemas/auth-api.schema';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const useAuthService = () => {
  const { post, get } = useApi();

  const login = async (payload: LoginPayload) => {
    const response = await post<LoginApiResponse | LoginPasswordChangeRequiredResponse>('/auth/login', {
      body: payload,
    });

    return loginApiResponseSchema.parse(response);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await post<RegisterApiResponse>('/auth/register', {
      body: payload,
    });

    return registerApiResponseSchema.parse(response);
  };

  const me = async () => {
    const response = await get<MeApiResponse>('/auth/me');

    return meApiResponseSchema.parse(response);
  };

  return {
    login,
    register,
    me,
  };
};
