<script setup lang="ts">
import { useRemoteSession } from '#layers/remote/app/composables/useRemoteSession';

import type { NeuroBalanceConfig } from '../composables/useNeuroBalance';

defineOptions({ name: 'NeuroBalanceSessionView' });

const { t } = useI18n();
const session = useRemoteSession();

const view = ref<'config' | 'exercise'>('config');

const exerciseConfig = ref<NeuroBalanceConfig>({
  durationMinutes: 10,
});

const canGoToExercise = computed(() => true);
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <Transition
      name="fade"
      mode="out-in"
    >
      <div
        v-if="view === 'config'"
        key="config"
        class="gap-x-lg gap-y-lg flex flex-col"
      >
        <section class="glass-card p-md sm:p-x-lg">
          <div class="gap-sm flex flex-wrap items-start justify-between">
            <div>
              <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
                {{ t('mindExercises.neuroBalance.kicker') }}
              </p>
              <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
                {{ t('mindExercises.neuroBalance.title') }}
              </h1>
              <p class="text-body-md text-on-surface-dim mt-x-sm max-w-[56rem]">
                {{ t('mindExercises.neuroBalance.about') }}
              </p>
            </div>
            <Icon
              name="lucide:brain-circuit"
              size="2.4rem"
              class="text-on-surface shrink-0"
            />
          </div>
        </section>

        <div class="gap-x-lg gap-y-lg lg:grid lg:grid-cols-2 lg:items-stretch">
          <DeploymentConfigPanel
            class="h-full min-w-0"
            :ready-models="session.readyModels.value"
            :is-loading-models="session.isLoadingModels.value"
            :selected-model-id="session.selectedModel.value?.id ?? null"
            :deployment="session.deployment.value"
            :is-running="session.isRunning.value"
            :is-transitional="session.isTransitional.value"
            :is-deploying="session.isDeploying.value"
            :is-stopping="session.isStopping.value"
            :can-deploy="session.canDeploy.value"
            :api-error="session.apiError.value"
            @select-model="session.selectModel"
            @deploy="session.handleDeploy"
            @stop="session.stopDeployment"
          />

          <NeuroBalanceConfigPanel
            class="min-w-0"
            :config="exerciseConfig"
            @update:config="exerciseConfig = $event"
          />
        </div>

        <div
          class="glass-card p-md sm:p-x-lg gap-md flex flex-wrap items-center justify-between"
          :class="canGoToExercise ? 'border-success/20' : 'border-on-surface/[0.06]'"
        >
          <div class="gap-md flex items-center">
            <div
              :class="[
                'flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                canGoToExercise ? 'bg-success/10 text-success' : 'bg-on-surface/[0.06] text-on-surface-dim',
              ]"
            >
              <Icon
                :name="canGoToExercise ? 'material-symbols:play-circle-outline' : 'material-symbols:play-disabled'"
                size="2.2rem"
              />
            </div>
            <div>
              <p class="text-body-md text-on-surface font-semibold">
                {{ t('mindExercises.neuroBalance.goToExercise') }}
              </p>
              <p class="text-body-sm text-on-surface-dim mt-xx-sm">
                {{ t('mindExercises.neuroBalance.goToExerciseHint') }}
              </p>
            </div>
          </div>

          <AppButton
            variant="inverse"
            size="md"
            :disabled="!canGoToExercise"
            @click="view = 'exercise'"
          >
            <Icon
              name="material-symbols:play-arrow"
              size="2rem"
              class="mr-xs"
            />
            {{ t('mindExercises.neuroBalance.goToExercise') }}
          </AppButton>
        </div>
      </div>

      <NeuroBalanceExercise
        v-else
        key="exercise"
        :config="exerciseConfig"
        @close="view = 'config'"
      />
    </Transition>
  </div>
</template>
