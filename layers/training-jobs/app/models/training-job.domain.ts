export type TrainingJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type TrainingJob = {
  id: string;
  userId: string;
  sessionIds: string[];
  rayJobId: string | null;
  status: TrainingJobStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DispatchTrainingJobPayload = {
  sessionIds: string[];
};
