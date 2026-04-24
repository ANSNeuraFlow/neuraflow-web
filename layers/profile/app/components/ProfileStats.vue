<script setup lang="ts">
import type { ProfileStats } from '../models/profile.domain';

defineProps<{
  stats: ProfileStats;
}>();
</script>

<template>
  <div class="mb-x-lg gap-md grid grid-cols-2 lg:grid-cols-4">
    <div class="glass-card p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-accent/5 pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl"
        aria-hidden="true"
      />
      <div class="gap-sm relative flex items-center">
        <div class="bg-accent/10 flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-xl">
          <Icon
            name="material-symbols:monitor-heart"
            size="2.2rem"
            class="text-accent"
          />
        </div>
        <div>
          <p class="text-body-x-sm text-on-surface-dim font-medium uppercase tracking-wider">
            {{ $t('profile.stats.eegSessions') }}
          </p>
          <p class="text-heading-md text-on-surface font-display font-bold">
            {{ stats.eegSessionCount }}
          </p>
        </div>
      </div>
    </div>

    <div class="glass-card p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-info/5 pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl"
        aria-hidden="true"
      />
      <div class="gap-sm relative flex items-center">
        <div class="bg-info/10 flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-xl">
          <Icon
            name="material-symbols:model-training"
            size="2.2rem"
            class="text-info"
          />
        </div>
        <div>
          <p class="text-body-x-sm text-on-surface-dim font-medium uppercase tracking-wider">
            {{ $t('profile.stats.trainingJobs') }}
          </p>
          <p class="text-heading-md text-on-surface font-display font-bold">
            {{ stats.trainingJobCount }}
          </p>
        </div>
      </div>
    </div>

    <div class="glass-card p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-success/5 pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl"
        aria-hidden="true"
      />
      <div class="gap-sm relative flex items-center">
        <div class="bg-success/10 flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-xl">
          <Icon
            name="material-symbols:neurology"
            size="2.2rem"
            class="text-success"
          />
        </div>
        <div>
          <p class="text-body-x-sm text-on-surface-dim font-medium uppercase tracking-wider">
            {{ $t('profile.stats.mlModels') }}
          </p>
          <p class="text-heading-md text-on-surface font-display font-bold">
            {{ stats.mlModelCount }}
          </p>
        </div>
      </div>
    </div>

    <div class="glass-card p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-warning/5 pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl"
        aria-hidden="true"
      />
      <div class="gap-sm relative flex items-center">
        <div class="bg-warning/10 flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-xl">
          <Icon
            name="material-symbols:rocket-launch"
            size="2.2rem"
            class="text-warning"
          />
        </div>
        <div>
          <p class="text-body-x-sm text-on-surface-dim font-medium uppercase tracking-wider">
            {{ $t('profile.stats.deployments') }}
          </p>
          <p class="text-heading-md text-on-surface font-display font-bold">
            {{ stats.modelDeploymentCount }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
