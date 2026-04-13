import type { TrainingJob } from '../models/training-job.domain';
import { useTrainingJobService } from '../services/training-job.service';

export const useTrainingJobs = () => {
  const { t } = useI18n();
  const service = useTrainingJobService();

  const jobs = ref<TrainingJob[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchJobs = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      jobs.value = await service.getTrainingJobs();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      error.value = e?.data?.message ?? t('trainingJobs.errors.fetchFailed');
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(fetchJobs);

  return { jobs, isLoading, error, fetchJobs };
};
