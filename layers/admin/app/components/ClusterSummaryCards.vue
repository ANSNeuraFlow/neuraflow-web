<script setup lang="ts">
import type { ClusterSummary } from '../models/cluster-api.domain';
import { getMetricColor, getMetricTextClass, METRIC_THRESHOLDS, toGb, toPercent } from '../utils/cluster.utils';

const props = defineProps<{
  summary: ClusterSummary;
}>();

const { t } = useI18n();

const overallHealth = computed(() => {
  const s = props.summary;
  const maxUsage = Math.max(s.cpu.usagePercent ?? 0, s.memory.usedPercent ?? 0, s.disk.usedPercent ?? 0);

  if (s.offlineNodes > 0 || maxUsage >= METRIC_THRESHOLDS.critical) {
    return { label: t('admin.cluster.health.critical'), colorClass: 'text-error' };
  }
  if (maxUsage >= METRIC_THRESHOLDS.warning) {
    return { label: t('admin.cluster.health.warning'), colorClass: 'text-warning' };
  }
  return { label: t('admin.cluster.health.excellent'), colorClass: 'text-success' };
});
</script>

<template>
  <div class="gap-md grid grid-cols-1 sm:grid-cols-3">
    <div class="glass-card p-x-lg">
      <div class="mb-md flex items-start justify-between">
        <p class="text-body-x-sm font-semibold uppercase tracking-wider text-neural-400">
          {{ $t('admin.cluster.summary.cpu') }}
        </p>
        <Icon
          name="material-symbols:speed"
          size="1.8rem"
          class="text-on-surface-dim"
        />
      </div>
      <p
        class="text-heading-lg font-display font-bold"
        :class="getMetricTextClass(summary.cpu.usagePercent)"
      >
        {{ toPercent(summary.cpu.usagePercent) }}
      </p>
      <AppProgressBar
        :value="summary.cpu.usagePercent ?? 0"
        :color="getMetricColor(summary.cpu.usagePercent)"
        :label="$t('admin.cluster.summary.cpu')"
        size="md"
        class="mt-md"
      />
    </div>

    <div class="glass-card p-x-lg">
      <div class="mb-md flex items-start justify-between">
        <p class="text-body-x-sm font-semibold uppercase tracking-wider text-neural-400">
          {{ $t('admin.cluster.summary.ram') }}
        </p>
        <Icon
          name="material-symbols:memory"
          size="1.8rem"
          class="text-on-surface-dim"
        />
      </div>
      <p
        class="text-heading-lg font-display font-bold"
        :class="getMetricTextClass(summary.memory.usedPercent)"
      >
        {{ toGb(summary.memory.usedBytes) }}
        <span class="text-body-lg text-on-surface-dim font-normal">
          GB / {{ toGb(summary.memory.totalBytes) }} GB
        </span>
      </p>
      <AppProgressBar
        :value="summary.memory.usedPercent ?? 0"
        :color="getMetricColor(summary.memory.usedPercent)"
        :label="$t('admin.cluster.summary.ram')"
        size="md"
        class="mt-md"
      />
    </div>

    <div class="glass-card p-x-lg">
      <div class="mb-md flex items-start justify-between">
        <p class="text-body-x-sm font-semibold uppercase tracking-wider text-neural-400">
          {{ $t('admin.cluster.summary.health') }}
        </p>
        <Icon
          name="material-symbols:monitor-heart"
          size="1.8rem"
          class="text-on-surface-dim"
        />
      </div>
      <p
        class="text-heading-lg font-display font-bold"
        :class="overallHealth.colorClass"
      >
        {{ overallHealth.label }}
      </p>
      <p class="text-body-sm mt-md text-on-surface-dim">
        {{
          $t('admin.cluster.summary.nodesOnline', {
            online: summary.onlineNodes,
            total: summary.totalNodes,
          })
        }}
      </p>
    </div>
  </div>
</template>
