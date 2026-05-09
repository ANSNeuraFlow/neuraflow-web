<script setup lang="ts">
import { useRemoteSession } from '../../composables/useRemoteSession';

const { t } = useI18n();

const session = useRemoteSession();

const controlMode = ref<'bci' | 'manual'>('bci');
const view = ref<'config' | 'control'>('config');

watch(controlMode, (mode, prev) => {
  if (prev === 'bci' && mode === 'manual' && view.value === 'config') {
    void session.stopDeployment();
  }
});

const modeFootnote = computed(() =>
  controlMode.value === 'bci' ? t('remote.droneConfig.modeFootnoteBci') : t('remote.droneConfig.modeFootnoteManual'),
);

const canStartSession = computed(() => controlMode.value === 'manual' || session.canStartControl.value);

const startControl = () => {
  view.value = 'control';
};

const endSession = async () => {
  view.value = 'config';
  await session.stopDeployment();
};

const segmentBtnClass = (mode: 'bci' | 'manual') =>
  [
    'text-body-sm min-h-[3.2rem] min-w-0 flex-1 px-x-sm py-x-sm text-center font-semibold transition-colors duration-150 sm:px-x-lg sm:py-x-sm',
    controlMode.value === mode
      ? 'bg-on-surface text-surface'
      : 'text-on-surface-dim hover:bg-on-surface/[0.07] hover:text-on-surface',
  ].join(' ');
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section
      v-if="view === 'config'"
      class="glass-card mb-x-lg p-md sm:p-x-lg"
    >
      <div class="gap-sm flex flex-wrap items-start justify-between">
        <div class="min-w-0">
          <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
            {{ t('remote.dronePage.kicker') }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ t('remote.dronePage.title') }}
          </h1>
          <p class="text-body-sm text-on-surface-dim mt-x-sm max-w-[72rem] leading-relaxed">
            {{ t('remote.droneConfig.introSubtitle') }}
          </p>
        </div>
        <Icon
          name="mdi:quadcopter"
          size="2.4rem"
          class="text-on-surface shrink-0"
          aria-hidden="true"
        />
      </div>
    </section>

    <section
      v-if="view === 'config'"
      class="glass-card mb-x-lg p-md sm:p-x-lg"
    >
      <div class="gap-sm mb-md flex flex-wrap items-start justify-between">
        <div class="min-w-0">
          <h2 class="text-heading-sm text-on-surface font-display font-bold">
            {{ t('remote.droneConfig.controlTileTitle') }}
          </h2>
          <p class="text-body-sm text-on-surface-dim mt-xx-sm max-w-[72rem] leading-relaxed">
            {{ t('remote.droneConfig.controlTileSubtitle') }}
          </p>
        </div>
        <Icon
          name="lucide:settings-2"
          size="2.4rem"
          class="text-on-surface shrink-0"
          aria-hidden="true"
        />
      </div>

      <div class="gap-md flex flex-col">
        <p
          id="drone-control-mode-label"
          class="text-body-sm text-on-surface-dim font-medium"
        >
          {{ t('remote.droneConfig.segmentLabel') }}
        </p>

        <div class="w-full max-w-[30rem] self-start sm:max-w-[36rem]">
          <div
            class="border-on-surface/[0.08] bg-on-surface/[0.03] divide-on-surface/[0.08] flex w-full divide-x overflow-hidden rounded-xl border"
            role="group"
            aria-labelledby="drone-control-mode-label"
          >
            <button
              type="button"
              :class="segmentBtnClass('bci')"
              role="radio"
              :aria-checked="controlMode === 'bci'"
              @click="controlMode = 'bci'"
            >
              {{ t('remote.droneHub.bciKicker') }}
            </button>
            <button
              type="button"
              :class="segmentBtnClass('manual')"
              role="radio"
              :aria-checked="controlMode === 'manual'"
              @click="controlMode = 'manual'"
            >
              {{ t('remote.droneHub.manualKicker') }}
            </button>
          </div>
        </div>

        <p class="text-body-x-sm text-on-surface-dim leading-relaxed">
          {{ modeFootnote }}
        </p>
      </div>
    </section>

    <div
      v-if="view === 'config'"
      class="gap-x-lg gap-y-lg flex flex-col"
    >
      <div
        class="gap-x-lg gap-y-lg lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch lg:justify-items-stretch"
      >
        <div class="min-h-[22rem] min-w-0 lg:col-start-1 lg:row-start-1 lg:min-h-[24rem]">
          <DeploymentConfigPanel
            v-if="controlMode === 'bci'"
            class="h-full min-h-0 min-w-0 lg:min-h-0"
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
            v-else
            class="glass-card border-on-surface/[0.08] p-md flex h-full min-h-[22rem] flex-col items-center justify-center border border-dashed lg:min-h-0"
            :aria-label="t('remote.droneManual.configPlaceholder')"
          >
            <p class="text-body-sm text-on-surface-dim/80 max-w-[36rem] text-center font-medium italic">
              {{ t('remote.droneManual.configPlaceholder') }}
            </p>
          </aside>
        </div>

        <aside
          class="glass-card border-on-surface/[0.08] flex min-h-[20rem] min-w-0 flex-col items-center justify-center border border-dashed lg:col-start-2 lg:row-start-1 lg:min-h-0"
          :aria-label="t('remote.session.wip')"
        >
          <p class="text-body-sm text-on-surface-dim/80 font-medium italic">
            {{ t('remote.session.wip') }}
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
              {{ t('remote.control.startSession') }}
            </p>
            <p class="text-body-sm text-on-surface-dim mt-xx-sm">
              {{
                controlMode === 'manual'
                  ? t('remote.droneManual.startHint')
                  : canStartSession
                    ? t('remote.control.readyHint')
                    : t('remote.control.startHint')
              }}
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
          {{ t('remote.control.startSession') }}
        </AppButton>
      </div>
    </div>

    <template v-else>
      <DroneManualControlPanel
        v-if="controlMode === 'manual'"
        @end-session="endSession"
      />
      <RemoteControlPlaceholder
        v-else
        vehicle-type="drone"
        @end-session="endSession"
      />
    </template>
  </div>
</template>
