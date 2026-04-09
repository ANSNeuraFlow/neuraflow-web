<script setup lang="ts">
import type { ClusterNode } from '../models/cluster-api.domain';
import { getMetricColor, getMetricTextClass, toPercent } from '../utils/cluster.utils';

const props = defineProps<{
  node: ClusterNode;
}>();

const nodeLabel = computed(() =>
  props.node.role === 'master' ? 'MASTER' : `WORKER ${props.node.id.replace('worker-', '')}`,
);

const roleIcon = computed(() =>
  props.node.role === 'master' ? 'material-symbols:dns' : 'material-symbols:developer-board',
);

const metricRows = computed(() => [
  {
    key: 'cpu',
    icon: 'material-symbols:speed',
    labelKey: 'admin.cluster.node.cpu',
    pct: props.node.cpu.usagePercent,
  },
  {
    key: 'ram',
    icon: 'material-symbols:memory',
    labelKey: 'admin.cluster.node.ram',
    pct: props.node.memory.usedPercent,
  },
  {
    key: 'disk',
    icon: 'material-symbols:hard-drive',
    labelKey: 'admin.cluster.node.disk',
    pct: props.node.disk.usedPercent,
  },
]);
</script>

<template>
  <div class="glass-card p-x-lg">
    <div class="border-on-surface/10 mb-md gap-sm pb-md flex items-center border-b">
      <Icon
        :name="roleIcon"
        size="2rem"
        :class="node.isOnline ? 'text-neural-400' : 'text-error'"
      />
      <div class="min-w-0 flex-1">
        <span class="text-body-sm text-on-surface block font-semibold uppercase tracking-wider">
          {{ nodeLabel }}
        </span>
        <span class="text-body-x-sm text-on-surface-dim font-mono">
          {{ node.address }}
        </span>
      </div>
    </div>

    <div class="mb-sm flex items-center justify-between">
      <div class="gap-xx-sm flex items-center">
        <Icon
          :name="node.isOnline ? 'material-symbols:check-circle' : 'material-symbols:cancel'"
          size="1.4rem"
          :class="node.isOnline ? 'text-success' : 'text-error'"
        />
        <span class="text-body-x-sm text-on-surface-dim uppercase tracking-wider">
          {{ $t('admin.cluster.node.status') }}
        </span>
      </div>
      <span
        class="text-body-x-sm font-semibold uppercase"
        :class="node.isOnline ? 'text-success' : 'text-error'"
      >
        {{ node.isOnline ? $t('admin.cluster.node.active') : $t('admin.cluster.node.down') }}
      </span>
    </div>

    <div
      v-for="(metric, index) in metricRows"
      :key="metric.key"
      :class="{ 'mb-sm': index < metricRows.length - 1 }"
    >
      <div class="mb-tiny flex items-center justify-between">
        <div class="gap-xx-sm flex items-center">
          <Icon
            :name="metric.icon"
            size="1.4rem"
            class="text-on-surface-dim"
          />
          <span class="text-body-x-sm text-on-surface-dim uppercase tracking-wider">
            {{ $t(metric.labelKey) }}
          </span>
        </div>
        <span
          class="text-body-x-sm font-semibold"
          :class="node.isOnline ? getMetricTextClass(metric.pct) : 'text-on-surface-dim'"
        >
          {{ node.isOnline ? toPercent(metric.pct) : toPercent(null) }}
        </span>
      </div>
      <AppProgressBar
        :value="node.isOnline ? (metric.pct ?? 0) : 0"
        :color="node.isOnline ? getMetricColor(metric.pct) : 'default'"
        :label="$t(metric.labelKey)"
        size="sm"
      />
    </div>
  </div>
</template>
