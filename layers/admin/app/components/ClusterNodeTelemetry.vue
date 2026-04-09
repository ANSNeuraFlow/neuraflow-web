<script setup lang="ts">
import type { ClusterNode } from '../models/cluster-api.domain';

defineProps<{
  nodes: ClusterNode[];
  onlineCount: number;
}>();
</script>

<template>
  <div>
    <div class="gap-sm mb-x-lg flex items-center justify-between">
      <div class="gap-sm flex items-center">
        <Icon
          name="material-symbols:grid-view"
          size="2rem"
          class="text-on-surface-dim"
        />
        <h2 class="text-body-md text-on-surface-dim font-semibold uppercase tracking-wider">
          {{ $t('admin.cluster.telemetry.title') }}
        </h2>
      </div>
      <span class="text-body-x-sm text-on-surface-dim font-semibold">
        {{ $t('admin.cluster.telemetry.activeNodes', { count: onlineCount }) }}
      </span>
    </div>

    <div class="gap-md grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      <ClusterNodeCard
        v-for="node in nodes"
        :key="node.id"
        :node="node"
      />
    </div>
  </div>
</template>
