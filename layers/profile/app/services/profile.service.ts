import { useApi } from '#layers/core/app/composables/useApi';

import { updateProfileResponseDto, userProfileDto } from '../dtos/profile.dto';
import type { UpdateProfilePayload, UserProfile } from '../models/profile.domain';

export const useProfileService = () => {
  const { get, patch } = useApi();

  const getProfile = async (): Promise<UserProfile> => {
    const response = await get<UserProfile>('/users/profile');
    return userProfileDto.parse(response);
  };

  const updateProfile = async (payload: UpdateProfilePayload): Promise<UserProfile> => {
    const response = await patch<UserProfile>('/users/profile', { body: payload });
    return updateProfileResponseDto.parse(response);
  };

  return { getProfile, updateProfile };
};
