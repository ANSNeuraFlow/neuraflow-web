<script setup lang="ts">
import type { MlModel } from '#layers/ml-models/app/models/ml-model.domain';
import type { AppSelectOption } from '#layers/neuraflow-core-layer/app/components/app-select/index';

import type { ModelDeployment } from '../models/model-deployment.domain';

const props = defineProps<{
  readyModels: MlModel[];
  isLoadingModels: boolean;
  selectedModelId: string | null;
  deployment: ModelDeployment | null;
  isRunning: boolean;
  isTransitional: boolean;
  isDeploying: boolean;
  isStopping: boolean;
  canDeploy: boolean;
  apiError: string | null;
}>();

const emit = defineEmits<{
  selectModel: [model: MlModel];
  deploy: [];
  stop: [];
}>();

const modelOptions = computed<AppSelectOption[]>(() => props.readyModels.map((m) => ({ label: m.name, value: m.id })));

const handleModelSelect = (id: string | number | null) => {
  if (!id) return;
  const model = props.readyModels.find((m) => m.id === String(id));
  if (model) emit('selectModel', model);
};

const isSelectDisabled = computed(() => props.isRunning || props.isTransitional || props.isDeploying);
</script>

<template>
  <div class="glass-card p-x-lg gap-x-lg flex flex-col">
    <div class="gap-md flex items-center">
      <div
        class="bg-on-surface/10 text-on-surface flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-full"
      >
        <Icon
          name="lucide:rocket"
          size="2rem"
        />
      </div>
      <div>
        <h2 class="text-heading-sm text-on-surface font-display font-bold">
          {{ $t('remote.deployment.panel.title') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-xx-sm">
          {{ $t('remote.deployment.panel.subtitle') }}
        </p>
      </div>
    </div>

    <div>
      <p class="text-body-sm text-on-surface-dim mb-sm font-medium">
        {{ $t('remote.deployment.panel.selectModel') }}
      </p>

      <div
        v-if="isLoadingModels"
        class="bg-on-surface/[0.05] h-[3.6rem] animate-pulse rounded-sm"
      />

      <div
        v-else-if="readyModels.length === 0"
        class="border-warning/25 bg-warning/[0.04] gap-sm p-sm flex items-center rounded-sm border border-dashed"
      >
        <Icon
          name="material-symbols:warning-outline"
          size="1.8rem"
          class="text-warning shrink-0"
        />
        <p class="text-body-sm text-on-surface-dim">
          {{ $t('remote.deployment.panel.noModels.title') }}
        </p>
      </div>

      <AppSelect
        v-else
        :model-value="selectedModelId"
        :options="modelOptions"
        :placeholder="$t('remote.deployment.panel.selectModel')"
        :disabled="isSelectDisabled"
        @update:model-value="handleModelSelect"
      />
    </div>

    <div class="border-on-surface/[0.06] pt-sm min-h-[5.2rem] border-t">
      <div
        v-if="deployment"
        class="bg-on-surface/[0.03] border-on-surface/[0.08] p-sm gap-sm flex flex-wrap items-center justify-between rounded-sm border"
      >
        <div class="gap-sm flex items-center">
          <div
            v-if="isRunning"
            class="relative flex h-[2.8rem] w-[2.8rem] shrink-0 items-center justify-center"
          >
            <span class="bg-success/25 absolute inset-0 animate-ping rounded-full" />
            <div
              class="bg-success/10 text-success relative flex h-full w-full items-center justify-center rounded-full"
            >
              <Icon
                name="material-symbols:check-circle-outline"
                size="1.4rem"
              />
            </div>
          </div>
          <div
            v-else
            class="bg-on-surface/10 text-on-surface flex h-[2.8rem] w-[2.8rem] shrink-0 items-center justify-center rounded-full"
          >
            <Icon
              name="material-symbols:sync"
              size="1.4rem"
              class="animate-spin"
            />
          </div>

          <div>
            <p :class="['text-body-sm font-medium', isRunning ? 'text-success' : 'text-on-surface']">
              {{
                isRunning ? $t('remote.deployment.panel.readyToStart') : $t('remote.deployment.panel.activeDeployment')
              }}
            </p>
            <DeploymentStatusBadge
              class="mt-xx-sm"
              :status="deployment.status"
            />
          </div>
        </div>

        <AppButton
          v-if="isRunning || isTransitional"
          variant="destructive"
          size="sm"
          :loading="isStopping"
          :disabled="isStopping"
          @click="emit('stop')"
        >
          {{ $t('remote.deployment.panel.stop') }}
        </AppButton>
      </div>

      <div
        v-if="apiError || deployment?.errorMessage"
        class="border-error/30 bg-error/10 text-error text-body-sm mt-sm p-sm rounded-sm border"
        role="alert"
      >
        <div class="gap-xs flex items-start">
          <Icon
            name="material-symbols:error-outline"
            size="1.6rem"
            class="mt-px shrink-0"
          />
          <span>{{ apiError ?? deployment?.errorMessage }}</span>
        </div>
      </div>
    </div>

    <div class="border-on-surface/[0.06] pt-sm flex min-h-[3.6rem] items-center justify-end border-t">
      <AppButton
        v-if="!isRunning && !isTransitional"
        variant="inverse"
        :loading="isDeploying"
        :disabled="!canDeploy"
        @click="emit('deploy')"
      >
        <Icon
          name="lucide:rocket"
          size="1.8rem"
          class="mr-xs"
        />
        {{ $t('remote.deployment.panel.deploy') }}
      </AppButton>
    </div>
  </div>
</template>
