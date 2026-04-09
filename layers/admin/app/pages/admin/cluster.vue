<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useClusterMetrics } from '../../composables/useClusterMetrics';

definePageMeta({
  layout: 'admin',
  requiredPermissions: ['VIEW_ADMIN_PANEL'],
});

const { metrics, isLoading, isConnected, error, fetchMetrics } = useClusterMetrics();
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-accent/5 pointer-events-none absolute -right-20 -top-20 h-[200px] w-[200px] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div class="gap-sm relative z-10 flex flex-wrap items-start justify-between">
        <div>
          <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
            {{ $t('admin.cluster.kicker') }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ $t('admin.cluster.title') }}
          </h1>
          <p class="text-body-md mt-xx-sm text-on-surface-dim">
            {{ $t('admin.cluster.subtitle', { count: metrics?.summary.totalNodes ?? 0 }) }}
          </p>
        </div>
        <div
          v-if="metrics"
          class="gap-xx-sm flex items-center"
        >
          <Icon
            name="material-symbols:sync"
            size="1.4rem"
            class="text-on-surface-dim"
          />
          <span class="text-body-x-sm text-on-surface-dim">
            {{ $t('admin.cluster.lastUpdate') }}:
            <span class="text-on-surface font-medium">
              {{ new Date(metrics.fetchedAt).toLocaleTimeString() }}
            </span>
          </span>
          <span
            class="text-body-x-sm font-semibold"
            :class="isConnected ? 'text-success' : 'text-warning'"
          >
            {{ isConnected ? $t('admin.cluster.connection.live') : $t('admin.cluster.connection.polling') }}
          </span>
        </div>
      </div>
    </section>

    <div
      v-if="error"
      class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-lg border"
      role="alert"
    >
      {{ error }}
      <AppButton
        variant="ghost"
        size="sm"
        class="ml-sm"
        @click="fetchMetrics"
      >
        {{ $t('admin.actions.retry') }}
      </AppButton>
    </div>

    <template v-if="isLoading">
      <div class="mb-x-lg gap-md grid grid-cols-1 sm:grid-cols-3">
        <div
          v-for="i in 3"
          :key="i"
          class="glass-card p-x-lg animate-pulse"
        >
          <div class="bg-on-surface/10 mb-md h-x-sm w-1/2 rounded-full" />
          <div class="bg-on-surface/20 mb-md h-xx-lg w-2/3 rounded-full" />
          <div class="bg-on-surface/10 h-xx-sm rounded-full" />
        </div>
      </div>
    </template>

    <template v-else-if="metrics">
      <ClusterSummaryCards
        :summary="metrics.summary"
        class="mb-x-lg"
      />
      <ClusterNodeTelemetry
        :nodes="metrics.nodes"
        :online-count="metrics.summary.onlineNodes"
      />
    </template>
  </div>
</template>
