import type { EegProtocolId } from '../constants/eeg-protocols.const';

export type SessionStatus = 'INITIALIZED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export type EegSession = {
  id: string;
  userId: string;
  sessionName: string;
  protocolName: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  endedAt: string | null;
};

export type CreateEegSessionPayload = {
  sessionName: string;
  protocolName: EegProtocolId;
};
