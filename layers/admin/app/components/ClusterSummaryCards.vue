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
  <div class="gap-x-lg grid grid-cols-1 sm:grid-cols-3">
    <div
      class="glass-card p-x-lg duration-short hover:border-on-surface/20 group relative overflow-hidden transition-all hover:shadow-2xl"
    >
      <div
        class="bg-on-surface/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
      <div class="relative z-10">
        <div class="mb-md flex items-center justify-between">
          <p class="text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">
            {{ $t('admin.cluster.summary.cpu') }}
          </p>
          <div
            class="bg-on-surface/5 group-hover:bg-on-surface/10 flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
          >
            <Icon
              name="material-symbols:speed"
              size="2rem"
              class="text-on-surface"
            />
          </div>
        </div>
        <p
          class="text-heading-lg font-display font-bold tabular-nums"
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
    </div>

    <div
      class="glass-card p-x-lg duration-short hover:border-on-surface/20 group relative overflow-hidden transition-all hover:shadow-2xl"
    >
      <div
        class="bg-on-surface/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
      <div class="relative z-10">
        <div class="mb-md flex items-center justify-between">
          <p class="text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">
            {{ $t('admin.cluster.summary.ram') }}
          </p>
          <div
            class="bg-on-surface/5 group-hover:bg-on-surface/10 flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
          >
            <Icon
              name="material-symbols:memory"
              size="2rem"
              class="text-on-surface"
            />
          </div>
        </div>
        <p
          class="text-heading-lg font-display font-bold tabular-nums"
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
    </div>

    <div
      class="glass-card p-x-lg duration-short hover:border-on-surface/20 group relative overflow-hidden transition-all hover:shadow-2xl"
    >
      <div
        class="bg-on-surface/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
      <div class="relative z-10">
        <div class="mb-md flex items-center justify-between">
          <p class="text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">
            {{ $t('admin.cluster.summary.health') }}
          </p>
          <div
            class="bg-on-surface/5 group-hover:bg-on-surface/10 flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
          >
            <Icon
              name="material-symbols:monitor-heart"
              size="2rem"
              class="text-on-surface"
            />
          </div>
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
  </div>
</template>
