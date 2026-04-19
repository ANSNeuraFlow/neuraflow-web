<script setup lang="ts">
import type { AppStatusBadgeProps } from '#layers/neuraflow-core-layer/app/components/app-status-badge/index';

import type { DeploymentStatus } from '../models/model-deployment.domain';

defineProps<{ status: DeploymentStatus }>();

const { t } = useI18n();

type StatusConfig = Pick<AppStatusBadgeProps, 'color' | 'icon' | 'spinning'>;

const STATUS_CONFIG: Record<DeploymentStatus, StatusConfig> = {
  PENDING: { color: 'info', icon: 'material-symbols:pending-outline' },
  STARTING: { color: 'accent', icon: 'material-symbols:sync', spinning: true },
  RUNNING: { color: 'success', icon: 'material-symbols:rocket-launch-outline' },
  STOPPING: { color: 'warning', icon: 'material-symbols:stop-circle-outline', spinning: true },
  STOPPED: { color: 'default', icon: 'material-symbols:stop-circle-outline' },
  FAILED: { color: 'error', icon: 'material-symbols:error-outline' },
};
</script>

<template>
  <AppStatusBadge
    v-bind="STATUS_CONFIG[status]"
    :label="t(`remote.deployment.status.${status}`)"
  />
</template>
