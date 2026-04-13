<script setup lang="ts">
import type { TrainingJob } from '../models/training-job.domain';

defineProps<{
  open: boolean;
  job: TrainingJob | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const { locale } = useI18n();

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
</script>

<template>
  <DialogRoot
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <DialogContent
        class="bg-surface/80 dark:bg-surface/30 !border-on-surface/10 fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-[52rem] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border shadow-[0_0_80px_rgba(0,0,0,0.4)] outline-none backdrop-blur-3xl"
      >
        <div
          class="bg-accent/5 dark:bg-accent/10 pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full blur-3xl transition-colors duration-500"
          aria-hidden="true"
        />
        <div
          class="noise-overlay"
          aria-hidden="true"
        />
        <div class="p-x-lg sm:p-xx-lg relative z-10">
          <div class="mb-x-lg gap-md flex items-start">
            <div
              class="bg-accent/10 text-accent flex h-[4.4rem] w-[4.4rem] shrink-0 items-center justify-center rounded-full"
            >
              <Icon
                name="material-symbols:model-training"
                size="2.2rem"
              />
            </div>
            <div class="flex-1">
              <DialogTitle class="text-heading-md tracking-sm text-on-surface font-display font-bold">
                {{ $t('trainingJobs.details.title') }}
              </DialogTitle>
              <p
                v-if="job"
                class="mt-xx-sm text-body-sm text-on-surface-dim break-all font-mono"
              >
                {{ job.id }}
              </p>
            </div>
            <DialogClose as-child>
              <button
                class="mt-xx-sm p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface shrink-0 rounded-lg transition-colors"
                :aria-label="$t('eegSessions.actions.cancel')"
              >
                <Icon
                  name="material-symbols:close"
                  size="2rem"
                />
              </button>
            </DialogClose>
          </div>

          <dl
            v-if="job"
            class="gap-sm grid grid-cols-1 sm:grid-cols-2"
          >
            <div class="bg-on-surface/[0.03] p-md rounded-lg">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('trainingJobs.details.status') }}
              </dt>
              <dd class="text-body-sm text-on-surface">
                {{ $t(`trainingJobs.status.${job.status}`) }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('trainingJobs.details.rayJobId') }}
              </dt>
              <dd class="text-body-sm text-on-surface break-all font-mono">
                {{ job.rayJobId ?? $t('trainingJobs.details.noRayJob') }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('trainingJobs.details.createdAt') }}
              </dt>
              <dd class="text-body-sm text-on-surface">
                {{ formatDate(job.createdAt) }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('trainingJobs.details.updatedAt') }}
              </dt>
              <dd class="text-body-sm text-on-surface">
                {{ formatDate(job.updatedAt) }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg sm:col-span-2">
              <dt class="text-body-x-sm text-on-surface-dim mb-sm font-medium uppercase tracking-wider">
                {{ $t('trainingJobs.details.sessions') }} ({{ job.sessionIds.length }})
              </dt>
              <dd class="gap-xx-sm flex max-h-[12rem] flex-col overflow-y-auto">
                <span
                  v-for="sid in job.sessionIds"
                  :key="sid"
                  class="text-body-x-sm bg-accent/10 text-accent px-sm py-xx-sm break-all rounded font-mono"
                >
                  {{ sid }}
                </span>
              </dd>
            </div>

            <div
              v-if="job.errorMessage"
              class="bg-error/10 p-md rounded-lg sm:col-span-2"
            >
              <dt class="text-body-x-sm text-error mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('trainingJobs.details.error') }}
              </dt>
              <dd class="text-body-sm text-error whitespace-pre-wrap break-words">
                {{ job.errorMessage }}
              </dd>
            </div>
          </dl>

          <div class="border-on-surface/10 pt-x-lg mt-x-lg flex justify-end border-t">
            <DialogClose as-child>
              <AppButton variant="secondary">
                {{ $t('eegSessions.actions.cancel') }}
              </AppButton>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
