import { useApi } from '#layers/core/app/composables/useApi';

import { mlModelDto, mlModelsListDto } from '../dtos/ml-model.dto';
import type { MlModel } from '../models/ml-model.domain';

export const useMlModelService = () => {
  const { get, delete: deleteFn } = useApi();

  const getModels = async (): Promise<MlModel[]> => {
    const response = await get<MlModel[]>('/models');
    return mlModelsListDto.parse(response);
  };

  const getModel = async (id: string): Promise<MlModel> => {
    const response = await get<MlModel>(`/models/${id}`);
    return mlModelDto.parse(response);
  };

  const deleteModel = async (id: string): Promise<void> => {
    await deleteFn(`/models/${id}`);
  };

  return { getModels, getModel, deleteModel };
};
