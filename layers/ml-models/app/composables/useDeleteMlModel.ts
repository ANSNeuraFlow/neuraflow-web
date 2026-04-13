import type { MlModel } from '../models/ml-model.domain';
import { useMlModelService } from '../services/ml-model.service';

export const useDeleteMlModel = (onSuccess: () => void) => {
  const { t } = useI18n();
  const service = useMlModelService();

  const targetModel = ref<MlModel | null>(null);
  const isDeleting = ref(false);
  const apiError = ref<string | null>(null);

  const open = (model: MlModel) => {
    targetModel.value = model;
    apiError.value = null;
  };

  const close = () => {
    targetModel.value = null;
    apiError.value = null;
  };

  const confirm = async () => {
    if (!targetModel.value) return;
    isDeleting.value = true;
    apiError.value = null;

    try {
      await service.deleteModel(targetModel.value.id);
      close();
      onSuccess();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      apiError.value = e?.data?.message ?? t('mlModels.errors.deleteFailed');
    } finally {
      isDeleting.value = false;
    }
  };

  return { targetModel, isDeleting, apiError, open, close, confirm };
};
