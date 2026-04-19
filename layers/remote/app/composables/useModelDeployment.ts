import type { MlModel } from '#layers/ml-models/app/models/ml-model.domain';

import type { ModelDeployment } from '../models/model-deployment.domain';
import { useModelDeploymentService } from '../services/model-deployment.service';

const TRANSITIONAL_STATUSES = ['PENDING', 'STARTING', 'STOPPING'] as const;
const POLL_INTERVAL_MS = 3000;

export const useModelDeployment = () => {
  const { t } = useI18n();
  const service = useModelDeploymentService();

  const deployment = ref<ModelDeployment | null>(null);
  const isDeploying = ref(false);
  const isStopping = ref(false);
  const isLoadingInitial = ref(false);
  const apiError = ref<string | null>(null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const isTransitional = computed(() =>
    deployment.value ? (TRANSITIONAL_STATUSES as readonly string[]).includes(deployment.value.status) : false,
  );

  const isRunning = computed(() => deployment.value?.status === 'RUNNING');
  const isFailed = computed(() => deployment.value?.status === 'FAILED');

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const refreshDeployment = async (id: string) => {
    try {
      deployment.value = await service.getDeployment(id);
      if (!isTransitional.value) stopPolling();
    } catch {
      stopPolling();
    }
  };

  const startPolling = (id: string) => {
    stopPolling();
    pollTimer = setInterval(() => refreshDeployment(id), POLL_INTERVAL_MS);
  };

  const fetchActiveDeployment = async () => {
    isLoadingInitial.value = true;
    try {
      const all = await service.getDeployments();
      const active = all.find((d) => ['RUNNING', 'STARTING', 'PENDING', 'STOPPING'].includes(d.status));
      deployment.value = active ?? null;
      if (active && isTransitional.value) startPolling(active.id);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      apiError.value = e?.data?.message ?? t('remote.deployment.errors.fetchFailed');
    } finally {
      isLoadingInitial.value = false;
    }
  };

  const deployModel = async (model: MlModel) => {
    isDeploying.value = true;
    apiError.value = null;
    try {
      deployment.value = await service.deploy(model.id);
      startPolling(deployment.value.id);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      apiError.value = e?.data?.message ?? t('remote.deployment.errors.deployFailed');
    } finally {
      isDeploying.value = false;
    }
  };

  const stopDeployment = async () => {
    if (!deployment.value) return;
    isStopping.value = true;
    apiError.value = null;
    try {
      await service.stopDeployment(deployment.value.id);
      await refreshDeployment(deployment.value.id);
      if (deployment.value && isTransitional.value) startPolling(deployment.value.id);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      apiError.value = e?.data?.message ?? t('remote.deployment.errors.stopFailed');
    } finally {
      isStopping.value = false;
    }
  };

  onMounted(fetchActiveDeployment);
  onUnmounted(stopPolling);

  return {
    deployment,
    isDeploying,
    isStopping,
    isLoadingInitial,
    isTransitional,
    isRunning,
    isFailed,
    apiError,
    deployModel,
    stopDeployment,
    fetchActiveDeployment,
  };
};
