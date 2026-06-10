<script setup lang="ts">
import { resolveEegProtocolKindUi } from '#layers/eeg-sessions/app/constants/eeg-protocols.const';

import type { MlModel, ModelStatus } from '../models/ml-model.domain';

const props = withDefaults(
  defineProps<{
    models: MlModel[];
    isLoading: boolean;
    sessionProtocolById?: Record<string, string>;
    pageSize?: number;
  }>(),
  {
    sessionProtocolById: () => ({}),
    pageSize: 10,
  },
);

const emit = defineEmits<{
  deleteModel: [model: MlModel];
  viewDetails: [model: MlModel];
}>();

const { locale, t } = useI18n();

const modelTrainingKindLabel = (model: MlModel) => {
  const proto = props.sessionProtocolById[model.sessionId];
  if (!proto) return t('eegSessions.protocolKind.unknown');
  const kind = resolveEegProtocolKindUi(proto);
  return t(`eegSessions.protocolKind.${kind}`);
};

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

const sortedModels = computed(() => {
  const list = [...props.models];
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
});

const totalPages = computed(() =>
  sortedModels.value.length === 0 ? 0 : Math.ceil(sortedModels.value.length / props.pageSize),
);

const currentPage = ref(1);

watch(
  () => [sortedModels.value.length, props.pageSize] as const,
  () => {
    const tp = totalPages.value;
    if (tp === 0) {
      currentPage.value = 1;
      return;
    }
    if (currentPage.value > tp) currentPage.value = tp;
  },
);

const paginatedModels = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  return sortedModels.value.slice(start, start + props.pageSize);
});

const rangeFrom = computed(() => (sortedModels.value.length === 0 ? 0 : (currentPage.value - 1) * props.pageSize + 1));

const rangeTo = computed(() => Math.min(currentPage.value * props.pageSize, sortedModels.value.length));

const goPrev = () => {
  if (currentPage.value > 1) currentPage.value -= 1;
};

const goNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1;
};

const paginationShowingParams = computed(() => ({
  from: rangeFrom.value,
  to: rangeTo.value,
  total: sortedModels.value.length,
}));

const paginationPageOfParams = computed(() => ({
  current: currentPage.value,
  total: Math.max(totalPages.value, 1),
}));
</script>

<template>
  <div class="w-full">
    <div class="overflow-x-auto">
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
            <th class="border-on-surface/10 py-sm pl-md min-w-0 border-b pr-0 font-medium">
              {{ $t('mlModels.table.name') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm whitespace-nowrap border-b font-medium">
              {{ $t('mlModels.table.sessionKind') }}
            </th>
            <th class="border-on-surface/10 py-sm pr-md whitespace-nowrap border-b pl-0 font-medium">
              {{ $t('mlModels.table.status') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm whitespace-nowrap border-b font-medium">
              {{ $t('mlModels.table.accuracy') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm whitespace-nowrap border-b font-medium">
              {{ $t('mlModels.table.trainedAt') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm w-[1%] whitespace-nowrap border-b text-center font-medium">
              {{ $t('mlModels.table.actions') }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="model in paginatedModels"
            :key="model.id"
            class="duration-short hover:bg-on-surface/[0.04] transition-colors"
          >
            <td class="border-on-surface/[0.06] py-sm pl-md text-body-md text-on-surface min-w-0 border-b pr-0">
              <span
                class="block truncate"
                :title="model.name"
              >
                {{ model.name }}
              </span>
            </td>

            <td
              class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim whitespace-nowrap border-b"
            >
              {{ modelTrainingKindLabel(model) }}
            </td>

            <td class="border-on-surface/[0.06] py-sm pr-md whitespace-nowrap border-b pl-0">
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

            <td
              class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim whitespace-nowrap border-b"
            >
              {{ formatAccuracy(model.accuracy) }}
            </td>

            <td
              class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim whitespace-nowrap border-b"
            >
              {{ formatDate(model.trainedAt) }}
            </td>

            <td class="border-on-surface/[0.06] px-md py-sm w-[1%] whitespace-nowrap border-b text-center align-middle">
              <div class="gap-xx-sm inline-flex items-center justify-center">
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

          <tr v-if="sortedModels.length === 0 && !isLoading">
            <td
              colspan="6"
              class="py-xx-lg text-body-md text-on-surface-dim text-center"
            >
              {{ $t('mlModels.table.empty') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!isLoading && sortedModels.length > 0"
      class="border-on-surface/[0.06] gap-sm px-md py-sm flex flex-wrap items-center justify-between border-t"
    >
      <p class="text-body-sm text-on-surface-dim">
        {{ $t('eegSessions.table.pagination.showing', paginationShowingParams) }}
      </p>
      <div class="gap-sm flex items-center">
        <span class="text-body-sm text-on-surface-dim">
          {{ $t('eegSessions.table.pagination.pageOf', paginationPageOfParams) }}
        </span>
        <AppButton
          variant="ghost"
          size="sm"
          :disabled="currentPage <= 1"
          :aria-label="$t('eegSessions.table.pagination.previous')"
          @click="goPrev"
        >
          <Icon
            name="material-symbols:chevron-left"
            size="1.8rem"
          />
          {{ $t('eegSessions.table.pagination.previous') }}
        </AppButton>
        <AppButton
          variant="ghost"
          size="sm"
          :disabled="currentPage >= totalPages"
          :aria-label="$t('eegSessions.table.pagination.next')"
          @click="goNext"
        >
          {{ $t('eegSessions.table.pagination.next') }}
          <Icon
            name="material-symbols:chevron-right"
            size="1.8rem"
          />
        </AppButton>
      </div>
    </div>
  </div>
</template>
