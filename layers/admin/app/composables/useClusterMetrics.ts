import { clusterOverviewDto } from '../dtos/cluster.dto';
import type { ClusterOverview } from '../models/cluster-api.domain';
import { useClusterService } from '../services/cluster.service';

const FALLBACK_POLL_INTERVAL_MS = 5000;
const WS_CLUSTER_EVENT = 'cluster:metrics_update';

export const useClusterMetrics = () => {
  const { t } = useI18n();
  const { $clusterSocket } = useNuxtApp();
  const clusterService = useClusterService();

  const metrics = ref<ClusterOverview | null>(null);
  const isLoading = ref(false);
  const isConnected = ref(false);
  const error = ref<string | null>(null);
  let isFetching = false;
  let fallbackTimer: ReturnType<typeof setInterval> | null = null;

  const fetchMetrics = async () => {
    if (isFetching) return;
    isFetching = true;
    if (metrics.value === null) isLoading.value = true;

    try {
      metrics.value = await clusterService.getClusterOverview();
      error.value = null;
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      error.value = e?.data?.message ?? t('admin.cluster.errors.fetchFailed');
    } finally {
      isLoading.value = false;
      isFetching = false;
    }
  };

  const startFallback = () => {
    if (fallbackTimer !== null) return;
    fallbackTimer = setInterval(fetchMetrics, FALLBACK_POLL_INTERVAL_MS);
  };

  const stopFallback = () => {
    if (fallbackTimer === null) return;
    clearInterval(fallbackTimer);
    fallbackTimer = null;
  };

  const onWsData = (raw: unknown) => {
    const parsed = clusterOverviewDto.safeParse(raw);
    if (parsed.success) {
      metrics.value = parsed.data;
      error.value = null;
    }
  };

  const onWsConnect = () => {
    isConnected.value = true;
    stopFallback();
    error.value = null;
  };

  const onWsDisconnect = () => {
    isConnected.value = false;
    startFallback();
  };

  const onWsError = (err: Error) => {
    isConnected.value = false;
    error.value = t('admin.cluster.errors.fetchFailed');
    startFallback();
    console.error('[ClusterSocket]', err.message);
  };

  onMounted(async () => {
    await fetchMetrics();

    $clusterSocket.on('connect', onWsConnect);
    $clusterSocket.on(WS_CLUSTER_EVENT, onWsData);
    $clusterSocket.on('disconnect', onWsDisconnect);
    $clusterSocket.on('connect_error', onWsError);

    $clusterSocket.connect();
  });

  onUnmounted(() => {
    $clusterSocket.off('connect', onWsConnect);
    $clusterSocket.off(WS_CLUSTER_EVENT, onWsData);
    $clusterSocket.off('disconnect', onWsDisconnect);
    $clusterSocket.off('connect_error', onWsError);
    $clusterSocket.disconnect();
    stopFallback();
  });

  return { metrics, isLoading, isConnected, error, fetchMetrics };
};
