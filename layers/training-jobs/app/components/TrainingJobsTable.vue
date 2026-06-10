<script setup lang="ts">
import type { TrainingJob, TrainingJobStatus } from '../models/training-job.domain';

const props = withDefaults(
  defineProps<{
    jobs: TrainingJob[];
    isLoading: boolean;
    pageSize?: number;
  }>(),
  {
    pageSize: 10,
  },
);

const emit = defineEmits<{
  viewDetails: [job: TrainingJob];
}>();

const { locale } = useI18n();

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const shortId = (id: string) => id.slice(0, 8) + '…';

const STATUS_BADGE_CLASS = {
  PENDING: 'bg-info/10 text-info',
  RUNNING: 'bg-accent/10 text-accent',
  COMPLETED: 'bg-success/10 text-success',
  FAILED: 'bg-error/10 text-error',
} as const satisfies Record<TrainingJobStatus, string>;

const getStatusBadgeClass = (status: TrainingJobStatus): string => STATUS_BADGE_CLASS[status];

const STATUS_ICON = {
  PENDING: 'material-symbols:pending-outline',
  RUNNING: 'material-symbols:sync',
  COMPLETED: 'material-symbols:check-circle-outline',
  FAILED: 'material-symbols:error-outline',
} as const satisfies Record<TrainingJobStatus, string>;

const getStatusIcon = (status: TrainingJobStatus): string => STATUS_ICON[status];

const isRunning = (status: TrainingJobStatus) => status === 'RUNNING';

const sortedJobs = computed(() => {
  const list = [...props.jobs];
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
});

const totalPages = computed(() =>
  sortedJobs.value.length === 0 ? 0 : Math.ceil(sortedJobs.value.length / props.pageSize),
);

const currentPage = ref(1);

watch(
  () => [sortedJobs.value.length, props.pageSize] as const,
  () => {
    const tp = totalPages.value;
    if (tp === 0) {
      currentPage.value = 1;
      return;
    }
    if (currentPage.value > tp) currentPage.value = tp;
  },
);

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  return sortedJobs.value.slice(start, start + props.pageSize);
});

const rangeFrom = computed(() => (sortedJobs.value.length === 0 ? 0 : (currentPage.value - 1) * props.pageSize + 1));

const rangeTo = computed(() => Math.min(currentPage.value * props.pageSize, sortedJobs.value.length));

const goPrev = () => {
  if (currentPage.value > 1) currentPage.value -= 1;
};

const goNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1;
};

const paginationShowingParams = computed(() => ({
  from: rangeFrom.value,
  to: rangeTo.value,
  total: sortedJobs.value.length,
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
        class="w-full table-fixed border-separate border-spacing-0"
      >
        <colgroup>
          <col class="w-[6.5rem]" />
          <col class="w-[10rem]" />
          <col class="w-[5.5rem]" />
          <col class="w-[7rem]" />
          <col class="w-[12rem]" />
          <col class="w-[4rem]" />
        </colgroup>
        <thead>
          <tr class="text-body-sm text-on-surface-dim text-left">
            <th class="border-on-surface/10 px-md py-sm border-b font-medium">
              {{ $t('trainingJobs.table.id') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm border-b font-medium">
              {{ $t('trainingJobs.table.status') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm border-b font-medium">
              {{ $t('trainingJobs.table.sessions') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm border-b font-medium">
              {{ $t('trainingJobs.table.rayJobId') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm border-b font-medium">
              {{ $t('trainingJobs.table.createdAt') }}
            </th>
            <th class="border-on-surface/10 px-md py-sm border-b text-left font-medium">
              {{ $t('trainingJobs.table.actions') }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="job in paginatedJobs"
            :key="job.id"
            class="duration-short hover:bg-on-surface/[0.04] transition-colors"
          >
            <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim border-b font-mono">
              {{ shortId(job.id) }}
            </td>

            <td class="border-on-surface/[0.06] px-md py-sm whitespace-nowrap border-b">
              <span
                :class="[
                  'gap-xs px-sm py-x-tiny text-body-x-sm inline-flex items-center rounded-full font-medium',
                  getStatusBadgeClass(job.status),
                ]"
              >
                <Icon
                  :name="getStatusIcon(job.status)"
                  size="1.2rem"
                  :class="{ 'animate-spin': isRunning(job.status) }"
                />
                {{ $t(`trainingJobs.status.${job.status}`) }}
              </span>
            </td>

            <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim border-b">
              {{ job.sessionIds.length }}
            </td>

            <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim border-b font-mono">
              {{ job.rayJobId ? shortId(job.rayJobId) : '—' }}
            </td>

            <td class="border-on-surface/[0.06] px-md py-sm text-body-sm text-on-surface-dim border-b">
              {{ formatDate(job.createdAt) }}
            </td>

            <td class="border-on-surface/[0.06] px-sm py-sm border-b align-middle">
              <div class="inline-flex">
                <AppButton
                  variant="ghost"
                  size="sm"
                  class="!px-xx-sm"
                  :title="$t('trainingJobs.actions.viewDetails')"
                  @click="emit('viewDetails', job)"
                >
                  <Icon
                    name="material-symbols:info-outline"
                    size="1.6rem"
                  />
                </AppButton>
              </div>
            </td>
          </tr>

          <tr v-if="sortedJobs.length === 0 && !isLoading">
            <td
              colspan="6"
              class="py-xx-lg text-body-md text-on-surface-dim text-center"
            >
              {{ $t('trainingJobs.table.empty') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="!isLoading && sortedJobs.length > 0"
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
