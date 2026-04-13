<script setup lang="ts">
import type { MlModel, ModelStatus } from '../models/ml-model.domain';

defineProps<{
  models: MlModel[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  deleteModel: [model: MlModel];
  viewDetails: [model: MlModel];
}>();

const { locale } = useI18n();

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAccuracy = (v: number | null) => (v !== null ? `${(v * 100).toFixed(1)} %` : '—');

const STATUS_BADGE_CLASS = {
  PENDING: 'bg-info/10 text-info',
  TRAINING: 'bg-accent/10 text-accent',
  READY: 'bg-success/10 text-success',
  FAILED: 'bg-error/10 text-error',
} as const satisfies Record<ModelStatus, string>;

const getStatusBadgeClass = (s: ModelStatus): string => STATUS_BADGE_CLASS[s];

const STATUS_ICON = {
  PENDING: 'material-symbols:pending-outline',
  TRAINING: 'material-symbols:sync',
  READY: 'material-symbols:check-circle-outline',
  FAILED: 'material-symbols:error-outline',
} as const satisfies Record<ModelStatus, string>;

const getStatusIcon = (s: ModelStatus): string => STATUS_ICON[s];

const isTraining = (s: ModelStatus) => s === 'TRAINING';
</script>

<template>
  <div class="w-full overflow-x-auto">
    <div
      v-if="isLoading"
      class="py-xx-lg flex items-center justify-center"
    >
      <Icon
        name="material-symbols:progress-activity"
        size="2.4rem"
        class="text-accent animate-spin"
      />
    </div>

    <table
      v-else
      class="w-full border-separate border-spacing-0"
    >
      <thead>
        <tr class="text-body-sm text-on-surface-dim text-left">
          <th class="border-on-surface/10 py-sm pl-md pr-sm min-w-0 border-b font-medium">
            {{ $t('mlModels.table.name') }}
          </th>
          <th class="border-on-surface/10 py-sm pl-sm pr-md whitespace-nowrap border-b font-medium">
            {{ $t('mlModels.table.status') }}
          </th>
          <th class="border-on-surface/10 px-md py-sm whitespace-nowrap border-b font-medium">
            {{ $t('mlModels.table.accuracy') }}
          </th>
          <th class="border-on-surface/10 px-md py-sm whitespace-nowrap border-b font-medium">
            {{ $t('mlModels.table.trainedAt') }}
          </th>
          <th class="border-on-surface/10 px-md py-sm w-[1%] whitespace-nowrap border-b text-left font-medium">
            {{ $t('mlModels.table.actions') }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="model in models"
          :key="model.id"
          class="duration-short hover:bg-on-surface/[0.04] transition-colors"
        >
          <td class="border-on-surface/[0.06] py-sm pl-md pr-sm text-body-md text-on-surface min-w-0 border-b">
            <span
              class="block truncate"
              :title="model.name"
            >
              {{ model.name }}
            </span>
          </td>

          <td class="border-on-surface/[0.06] py-sm pl-sm pr-md whitespace-nowrap border-b">
            <span
              :class="[
                'gap-xs px-sm py-x-tiny text-body-x-sm inline-flex items-center rounded-full font-medium',
                getStatusBadgeClass(model.status),
              ]"
            >
              <Icon
                :name="getStatusIcon(model.status)"
                size="1.2rem"
                :class="{ 'animate-spin': isTraining(model.status) }"
              />
              {{ $t(`mlModels.status.${model.status}`) }}
            </span>
          </td>

          <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim whitespace-nowrap border-b">
            {{ formatAccuracy(model.accuracy) }}
          </td>

          <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim whitespace-nowrap border-b">
            {{ formatDate(model.trainedAt) }}
          </td>

          <td class="border-on-surface/[0.06] px-md py-sm w-[1%] whitespace-nowrap border-b align-middle">
            <div class="gap-xx-sm inline-flex items-center">
              <AppButton
                variant="ghost"
                size="sm"
                class="!px-xx-sm"
                :title="$t('mlModels.actions.viewDetails')"
                @click="emit('viewDetails', model)"
              >
                <Icon
                  name="material-symbols:info-outline"
                  size="1.6rem"
                />
              </AppButton>
              <AppButton
                variant="ghost"
                size="sm"
                class="!px-xx-sm text-error hover:bg-error/10"
                :title="$t('mlModels.actions.delete')"
                @click="emit('deleteModel', model)"
              >
                <Icon
                  name="material-symbols:delete-outline"
                  size="1.6rem"
                />
              </AppButton>
            </div>
          </td>
        </tr>

        <tr v-if="models.length === 0 && !isLoading">
          <td
            colspan="5"
            class="py-xx-lg text-body-md text-on-surface-dim text-center"
          >
            {{ $t('mlModels.table.empty') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
