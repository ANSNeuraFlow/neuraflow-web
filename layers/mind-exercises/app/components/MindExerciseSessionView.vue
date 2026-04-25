<script setup lang="ts">
import { useRemoteSession } from '#layers/remote/app/composables/useRemoteSession';

const { t } = useI18n();

const session = useRemoteSession();

const view = ref<'config' | 'control'>('config');

const canStartSession = computed(() => true);

const startControl = () => {
  view.value = 'control';
};

const endSession = async () => {
  view.value = 'config';
  await session.stopDeployment();
};
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg">
      <div class="gap-sm flex flex-wrap items-start justify-between">
        <div>
          <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
            {{ t('mindExercises.blockSlide.kicker') }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ t('mindExercises.blockSlide.title') }}
          </h1>
          <p class="text-body-md text-on-surface-dim mt-x-sm max-w-[56rem]">
            {{ t('mindExercises.blockSlide.sessionAbout') }}
          </p>
        </div>
        <Icon
          name="lucide:move-horizontal"
          size="2.4rem"
          class="text-on-surface"
        />
      </div>
    </section>

    <Transition
      name="fade"
      mode="out-in"
    >
      <div
        v-if="view === 'config'"
        key="config"
        class="gap-x-lg gap-y-lg flex flex-col"
      >
        <div class="gap-x-lg gap-y-lg lg:grid lg:grid-cols-2 lg:items-stretch">
          <DeploymentConfigPanel
            class="min-w-0"
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

          <aside
            class="glass-card border-on-surface/[0.08] flex min-h-[20rem] flex-col items-center justify-center border border-dashed lg:min-h-0"
            :aria-label="t('mindExercises.session.wip')"
          >
            <p class="text-body-sm text-on-surface-dim/80 font-medium italic">
              {{ t('mindExercises.session.wip') }}
            </p>
          </aside>
        </div>

        <div
          class="glass-card p-md sm:p-x-lg gap-md flex flex-wrap items-center justify-between"
          :class="canStartSession ? 'border-success/20' : 'border-on-surface/[0.06]'"
        >
          <div class="gap-md flex items-center">
            <div
              :class="[
                'flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                canStartSession ? 'bg-success/10 text-success' : 'bg-on-surface/[0.06] text-on-surface-dim',
              ]"
            >
              <Icon
                :name="canStartSession ? 'material-symbols:play-circle-outline' : 'material-symbols:play-disabled'"
                size="2.2rem"
              />
            </div>
            <div>
              <p class="text-body-md text-on-surface font-semibold">
                {{ t('mindExercises.control.startSession') }}
              </p>
              <p class="text-body-sm text-on-surface-dim mt-xx-sm">
                {{ t('mindExercises.control.startHint') }}
              </p>
            </div>
          </div>

          <AppButton
            variant="inverse"
            size="md"
            :disabled="!canStartSession"
            @click="startControl"
          >
            <Icon
              name="material-symbols:play-arrow"
              size="2rem"
              class="mr-xs"
            />
            {{ t('mindExercises.control.startSession') }}
          </AppButton>
        </div>
      </div>

      <MindExerciseControlPlaceholder
        v-else
        key="control"
        @end-session="endSession"
      />
    </Transition>
  </div>
</template>
