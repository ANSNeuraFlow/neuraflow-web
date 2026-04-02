import { useApi } from '#layers/core/app/composables/useApi';

import type {
  LoginApiResponse,
  LoginPasswordChangeRequiredResponse,
  MeApiResponse,
  RegisterApiResponse,
} from '../models/auth-api.domain';

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

  const login = (payload: LoginPayload) =>
    post<LoginApiResponse | LoginPasswordChangeRequiredResponse>('/auth/login', {
      body: payload,
    });

  const register = (payload: RegisterPayload) =>
    post<RegisterApiResponse>('/auth/register', {
      body: payload,
    });

  const me = () => get<MeApiResponse>('/auth/me');

  return { login, register, me };
};
