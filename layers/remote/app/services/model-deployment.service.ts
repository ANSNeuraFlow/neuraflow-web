import { useApi } from '#layers/core/app/composables/useApi';

import { modelDeploymentDto, modelDeploymentsListDto } from '../dtos/model-deployment.dto';
import type { ModelDeployment } from '../models/model-deployment.domain';

export const useModelDeploymentService = () => {
  const { get, post, delete: deleteFn } = useApi();

  const getDeployments = async (): Promise<ModelDeployment[]> => {
    const response = await get<ModelDeployment[]>('/model-deployments');
    return modelDeploymentsListDto.parse(response);
  };

  const getDeployment = async (id: string): Promise<ModelDeployment> => {
    const response = await get<ModelDeployment>(`/model-deployments/${id}`);
    return modelDeploymentDto.parse(response);
  };

  const deploy = async (modelId: string): Promise<ModelDeployment> => {
    const response = await post<ModelDeployment>('/model-deployments', {
      body: { modelId },
    });
    return modelDeploymentDto.parse(response);
  };

  const stopDeployment = async (id: string): Promise<void> => {
    await deleteFn(`/model-deployments/${id}`);
  };

  return { getDeployments, getDeployment, deploy, stopDeployment };
};
