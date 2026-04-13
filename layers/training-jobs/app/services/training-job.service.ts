import { useApi } from '#layers/core/app/composables/useApi';

import { trainingJobDto, trainingJobsListDto } from '../dtos/training-job.dto';
import type { DispatchTrainingJobPayload, TrainingJob } from '../models/training-job.domain';

export const useTrainingJobService = () => {
  const { get, post } = useApi();

  const getTrainingJobs = async (): Promise<TrainingJob[]> => {
    const response = await get<TrainingJob[]>('/training-jobs');
    return trainingJobsListDto.parse(response);
  };

  const getTrainingJob = async (id: string): Promise<TrainingJob> => {
    const response = await get<TrainingJob>(`/training-jobs/${id}`);
    return trainingJobDto.parse(response);
  };

  const dispatchTrainingJob = async (payload: DispatchTrainingJobPayload): Promise<TrainingJob> => {
    const response = await post<TrainingJob>('/training-jobs', { body: payload });
    return trainingJobDto.parse(response);
  };

  return { getTrainingJobs, getTrainingJob, dispatchTrainingJob };
};
