import type { MlModel } from '../models/ml-model.domain';
import { useMlModelService } from '../services/ml-model.service';

export const useMlModels = () => {
  const { t } = useI18n();
  const service = useMlModelService();

  const models = ref<MlModel[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchModels = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      models.value = await service.getModels();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      error.value = e?.data?.message ?? t('mlModels.errors.fetchFailed');
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(fetchModels);

  return { models, isLoading, error, fetchModels };
};
