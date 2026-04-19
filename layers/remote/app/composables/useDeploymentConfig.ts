import type { MlModel } from '#layers/ml-models/app/models/ml-model.domain';
import { useMlModelService } from '#layers/ml-models/app/services/ml-model.service';

export const useDeploymentConfig = () => {
  const { t } = useI18n();
  const mlModelService = useMlModelService();

  const availableModels = ref<MlModel[]>([]);
  const selectedModel = ref<MlModel | null>(null);
  const isLoadingModels = ref(false);
  const modelsError = ref<string | null>(null);

  const readyModels = computed(() => availableModels.value.filter((m) => m.status === 'READY'));

  const fetchModels = async () => {
    isLoadingModels.value = true;
    modelsError.value = null;
    try {
      availableModels.value = await mlModelService.getModels();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      modelsError.value = e?.data?.message ?? t('remote.deployment.errors.modelsFetchFailed');
    } finally {
      isLoadingModels.value = false;
    }
  };

  const selectModel = (model: MlModel) => {
    selectedModel.value = model;
  };

  const clearSelection = () => {
    selectedModel.value = null;
  };

  onMounted(fetchModels);

  return {
    availableModels,
    readyModels,
    selectedModel,
    isLoadingModels,
    modelsError,
    fetchModels,
    selectModel,
    clearSelection,
  };
};
