import { useApi } from '#layers/core/app/composables/useApi';

import { loginApiResponseDto, meApiResponseDto, registerApiResponseDto } from '../dtos/auth.dto';
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

  const login = async (payload: LoginPayload) => {
    const response = await post<LoginApiResponse | LoginPasswordChangeRequiredResponse>('/auth/login', {
      body: payload,
    });

    return loginApiResponseDto.parse(response);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await post<RegisterApiResponse>('/auth/register', {
      body: payload,
    });

    return registerApiResponseDto.parse(response);
  };

  const me = async () => {
    const response = await get<MeApiResponse>('/auth/me');

    return meApiResponseDto.parse(response);
  };

  return {
    login,
    register,
    me,
  };
};
