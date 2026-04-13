export type ModelStatus = 'PENDING' | 'TRAINING' | 'READY' | 'FAILED';

export type MlModel = {
  id: string;
  userId: string;
  trainingJobId: string;
  sessionId: string;
  name: string;
  status: ModelStatus;
  accuracy: number | null;
  filePath: string | null;
  fileSize: number | null;
  trainedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
