<script setup lang="ts">
import { useRemoteSession } from '../composables/useRemoteSession';

const props = defineProps<{
  vehicleType: 'drone' | 'car';
}>();

const { t } = useI18n();

const session = useRemoteSession();

const view = ref<'config' | 'control'>('config');

const header = computed(() => {
  if (props.vehicleType === 'drone') {
    return {
      kicker: t('remote.dronePage.kicker'),
      title: t('remote.dronePage.title'),
      icon: 'mdi:quadcopter',
    };
  }
  return {
    kicker: t('remote.carPage.kicker'),
    title: t('remote.carPage.title'),
    icon: 'lucide:car',
  };
});

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
            {{ header.kicker }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ header.title }}
          </h1>
        </div>
        <Icon
          :name="header.icon"
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
            :aria-label="t('remote.session.wip')"
          >
            <p class="text-body-sm text-on-surface-dim/80 font-medium italic">
              {{ t('remote.session.wip') }}
            </p>
          </aside>
        </div>

        <div
          class="glass-card p-md sm:p-x-lg gap-md flex flex-wrap items-center justify-between"
          :class="session.canStartControl.value ? 'border-success/20' : 'border-on-surface/[0.06]'"
        >
          <div class="gap-md flex items-center">
            <div
              :class="[
                'flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                session.canStartControl.value
                  ? 'bg-success/10 text-success'
                  : 'bg-on-surface/[0.06] text-on-surface-dim',
              ]"
            >
              <Icon
                :name="
                  session.canStartControl.value
                    ? 'material-symbols:play-circle-outline'
                    : 'material-symbols:play-disabled'
                "
                size="2.2rem"
              />
            </div>
            <div>
              <p class="text-body-md text-on-surface font-semibold">
                {{ t('remote.control.startSession') }}
              </p>
              <p class="text-body-sm text-on-surface-dim mt-xx-sm">
                {{ session.canStartControl.value ? t('remote.control.readyHint') : t('remote.control.startHint') }}
              </p>
            </div>
          </div>

          <AppButton
            variant="inverse"
            size="md"
            :disabled="!session.canStartControl.value"
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

      <RemoteControlPlaceholder
        v-else
        key="control"
        :vehicle-type="vehicleType"
        @end-session="endSession"
      />
    </Transition>
  </div>
</template>
