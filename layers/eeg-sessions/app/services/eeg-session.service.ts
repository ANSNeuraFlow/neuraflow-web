import { useApi } from '#layers/core/app/composables/useApi';

import { eegSessionDto, eegSessionsListDto } from '../dtos/eeg-session.dto';
import type { CreateEegSessionPayload, EegSession } from '../models/eeg-session.domain';

export const useEegSessionService = () => {
  const { get, post, patch, delete: deleteFn } = useApi();

  const getSessions = async (): Promise<EegSession[]> => {
    const response = await get<EegSession[]>('/sessions');
    return eegSessionsListDto.parse(response);
  };

  const createSession = async (payload: CreateEegSessionPayload): Promise<EegSession> => {
    const response = await post<EegSession>('/sessions', { body: payload });
    return eegSessionDto.parse(response);
  };

  const stopSession = async (id: string): Promise<EegSession> => {
    const response = await patch<EegSession>(`/sessions/${id}/stop`);
    return eegSessionDto.parse(response);
  };

  const deleteSession = async (id: string): Promise<void> => {
    await deleteFn(`/sessions/${id}`);
  };

  return { getSessions, createSession, stopSession, deleteSession };
};
