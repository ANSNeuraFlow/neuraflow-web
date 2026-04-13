<script setup lang="ts">
import type { TrainingJob, TrainingJobStatus } from '../models/training-job.domain';

defineProps<{
  jobs: TrainingJob[];
  isLoading: boolean;
}>();

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
          v-for="job in jobs"
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

        <tr v-if="jobs.length === 0 && !isLoading">
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
</template>
