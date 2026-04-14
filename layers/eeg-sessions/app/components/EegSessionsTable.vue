<script setup lang="ts">
import type { EegSession, SessionStatus } from '../models/eeg-session.domain';

const props = withDefaults(
  defineProps<{
    sessions: EegSession[];
    isLoading: boolean;
    selectable?: boolean;
    selectedIds?: string[];
    pageSize?: number;
  }>(),
  {
    selectable: false,
    selectedIds: undefined,
    pageSize: 10,
  },
);

const emit = defineEmits<{
  stopSession: [session: EegSession];
  deleteSession: [session: EegSession];
  'update:selectedIds': [ids: string[]];
}>();

const { locale } = useI18n();

const colCount = computed(() => (props.selectable ? 6 : 5));

const sortedSessions = computed(() => {
  const list = [...props.sessions];
  list.sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return tb - ta;
  });
  return list;
});

const totalPages = computed(() =>
  sortedSessions.value.length === 0 ? 0 : Math.ceil(sortedSessions.value.length / props.pageSize),
);

const currentPage = ref(1);

watch(
  () => [sortedSessions.value.length, props.pageSize] as const,
  () => {
    const tp = totalPages.value;
    if (tp === 0) {
      currentPage.value = 1;
      return;
    }
    if (currentPage.value > tp) currentPage.value = tp;
  },
);

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  return sortedSessions.value.slice(start, start + props.pageSize);
});

const rangeFrom = computed(() =>
  sortedSessions.value.length === 0 ? 0 : (currentPage.value - 1) * props.pageSize + 1,
);

const rangeTo = computed(() => Math.min(currentPage.value * props.pageSize, sortedSessions.value.length));

const goPrev = () => {
  if (currentPage.value > 1) currentPage.value -= 1;
};

const goNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1;
};

const paginationShowingParams = computed(() => ({
  from: rangeFrom.value,
  to: rangeTo.value,
  total: sortedSessions.value.length,
}));

const paginationPageOfParams = computed(() => ({
  current: currentPage.value,
  total: Math.max(totalPages.value, 1),
}));

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

const STATUS_BADGE_CLASS = {
  INITIALIZED: 'bg-info/10 text-info',
  ACTIVE: 'bg-success/10 text-success',
  COMPLETED: 'bg-on-surface/10 text-on-surface-dim',
  FAILED: 'bg-error/10 text-error',
} as const satisfies Record<SessionStatus, string>;

const getStatusBadgeClass = (status: SessionStatus): string => STATUS_BADGE_CLASS[status];

const STATUS_ICON = {
  INITIALIZED: 'material-symbols:pending-outline',
  ACTIVE: 'material-symbols:radio-button-checked',
  COMPLETED: 'material-symbols:check-circle-outline',
  FAILED: 'material-symbols:error-outline',
} as const satisfies Record<SessionStatus, string>;

const getStatusIcon = (status: SessionStatus): string => STATUS_ICON[status];

const toggleSelect = (id: string) => {
  const current = props.selectedIds ?? [];
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  emit('update:selectedIds', next);
};
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
            <th class="border-on-surface/10 px-md py-sm border-b font-medium">
              {{ $t('eegSessions.table.sessionName') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm border-b font-medium">
              {{ $t('eegSessions.table.protocol') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm border-b font-medium">
              {{ $t('eegSessions.table.status') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm border-b font-medium">
              {{ $t('eegSessions.table.createdAt') }}
            </th>
            <th
              v-if="selectable"
              class="border-on-surface/10 px-md py-sm border-b text-center font-medium"
            >
              {{ $t('eegSessions.table.includeForTraining') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm border-b font-medium">
              {{ $t('eegSessions.table.actions') }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="session in paginatedSessions"
            :key="session.id"
            class="duration-short hover:bg-on-surface/[0.04] transition-colors"
          >
            <td class="border-on-surface/[0.06] px-md py-sm text-body-md text-on-surface border-b">
              {{ session.sessionName }}
            </td>
            <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim border-b">
              {{ session.protocolName }}
            </td>
            <td class="border-on-surface/[0.06] px-md py-sm border-b">
              <span
                :class="[
                  'gap-xs px-sm py-x-tiny text-body-x-sm inline-flex items-center rounded-full font-medium',
                  getStatusBadgeClass(session.status),
                ]"
              >
                <Icon
                  :name="getStatusIcon(session.status)"
                  size="1.2rem"
                />
                {{ $t(`eegSessions.status.${session.status}`) }}
              </span>
            </td>
            <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim border-b">
              {{ formatDate(session.createdAt) }}
            </td>
            <td
              v-if="selectable"
              class="border-on-surface/[0.06] px-md py-sm border-b text-center"
            >
              <input
                v-if="session.status === 'COMPLETED'"
                type="checkbox"
                :checked="selectedIds?.includes(session.id)"
                class="accent-accent h-[1.6rem] w-[1.6rem] cursor-pointer rounded"
                :aria-label="$t('eegSessions.table.includeForTrainingAria', { name: session.sessionName })"
                @change="toggleSelect(session.id)"
              />
              <span
                v-else
                class="text-body-sm text-on-surface-dim/40"
                :title="$t('eegSessions.table.includeForTrainingDisabled')"
              >
                —
              </span>
            </td>
            <td class="border-on-surface/[0.06] px-md py-sm border-b">
              <div class="gap-sm flex items-center">
                <AppButton
                  v-if="session.status === 'INITIALIZED' || session.status === 'ACTIVE'"
                  variant="ghost"
                  size="sm"
                  :title="$t('eegSessions.actions.stop')"
                  class="text-warning hover:bg-warning/10"
                  @click="emit('stopSession', session)"
                >
                  <Icon
                    name="material-symbols:stop-circle-outline"
                    size="1.6rem"
                  />
                </AppButton>
                <AppButton
                  variant="ghost"
                  size="sm"
                  :title="$t('eegSessions.actions.delete')"
                  class="text-error hover:bg-error/10"
                  :disabled="session.status === 'ACTIVE'"
                  @click="emit('deleteSession', session)"
                >
                  <Icon
                    name="material-symbols:delete-outline"
                    size="1.6rem"
                  />
                </AppButton>
              </div>
            </td>
          </tr>

          <tr v-if="sortedSessions.length === 0 && !isLoading">
            <td
              :colspan="colCount"
              class="py-xx-lg text-body-md text-on-surface-dim text-center"
            >
              {{ $t('eegSessions.table.empty') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!isLoading && sortedSessions.length > 0"
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
