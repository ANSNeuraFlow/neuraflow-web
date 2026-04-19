import { computed } from 'vue';

import { useDeploymentConfig } from './useDeploymentConfig';
import { useModelDeployment } from './useModelDeployment';

export const useRemoteSession = () => {
  const config = useDeploymentConfig();
  const deployment = useModelDeployment();

  const canStartControl = computed(() => deployment.isRunning.value);

  const canDeploy = computed(
    () => !!config.selectedModel.value && !deployment.isRunning.value && !deployment.isTransitional.value,
  );

  const handleDeploy = async () => {
    if (!config.selectedModel.value) return;
    await deployment.deployModel(config.selectedModel.value);
  };

  return {
    readyModels: config.readyModels,
    selectedModel: config.selectedModel,
    isLoadingModels: config.isLoadingModels,
    modelsError: config.modelsError,
    selectModel: config.selectModel,

    deployment: deployment.deployment,
    isDeploying: deployment.isDeploying,
    isStopping: deployment.isStopping,
    isLoadingInitial: deployment.isLoadingInitial,
    isRunning: deployment.isRunning,
    isTransitional: deployment.isTransitional,
    isFailed: deployment.isFailed,
    apiError: deployment.apiError,
    stopDeployment: deployment.stopDeployment,

    canDeploy,
    canStartControl,
    handleDeploy,
  };
};
