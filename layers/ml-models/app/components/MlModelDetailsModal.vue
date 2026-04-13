<script setup lang="ts">
import type { MlModel } from '../models/ml-model.domain';

defineProps<{
  open: boolean;
  model: MlModel | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const { locale } = useI18n();

const formatDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAccuracy = (v: number | null) => (v !== null ? `${(v * 100).toFixed(1)} %` : '—');

const formatFileSize = (bytes: number | null) => {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(2)} MB`;
};
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
          class="bg-success/5 dark:bg-success/10 pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full blur-3xl transition-colors duration-500"
          aria-hidden="true"
        />
        <div
          class="noise-overlay"
          aria-hidden="true"
        />
        <div class="p-x-lg sm:p-xx-lg relative z-10">
          <div class="mb-x-lg gap-md flex items-start">
            <div
              class="bg-success/10 text-success flex h-[4.4rem] w-[4.4rem] shrink-0 items-center justify-center rounded-full"
            >
              <Icon
                name="material-symbols:neurology"
                size="2.2rem"
              />
            </div>
            <div class="flex-1">
              <DialogTitle class="text-heading-md tracking-sm text-on-surface font-display font-bold">
                {{ model?.name ?? $t('mlModels.details.title') }}
              </DialogTitle>
              <p
                v-if="model"
                class="mt-xx-sm text-body-sm text-on-surface-dim break-all font-mono"
              >
                {{ model.id }}
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
            v-if="model"
            class="gap-sm grid grid-cols-1 sm:grid-cols-2"
          >
            <div class="bg-on-surface/[0.03] p-md rounded-lg">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('mlModels.details.name') }}
              </dt>
              <dd class="text-body-sm text-on-surface">
                {{ model.name }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('mlModels.details.status') }}
              </dt>
              <dd class="text-body-sm text-on-surface">
                {{ $t(`mlModels.status.${model.status}`) }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('mlModels.details.accuracy') }}
              </dt>
              <dd class="text-body-sm text-on-surface">
                {{ formatAccuracy(model.accuracy) }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('mlModels.details.fileSize') }}
              </dt>
              <dd class="text-body-sm text-on-surface">
                {{ formatFileSize(model.fileSize) }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg sm:col-span-2">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('mlModels.details.trainingJob') }}
              </dt>
              <dd class="text-body-sm text-on-surface break-all font-mono">
                {{ model.trainingJobId }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg sm:col-span-2">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('mlModels.details.sessionId') }}
              </dt>
              <dd class="text-body-sm text-on-surface break-all font-mono">
                {{ model.sessionId }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg sm:col-span-2">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('mlModels.details.filePath') }}
              </dt>
              <dd class="text-body-sm text-on-surface break-all font-mono">
                {{ model.filePath ?? $t('mlModels.details.noFile') }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('mlModels.details.trainedAt') }}
              </dt>
              <dd class="text-body-sm text-on-surface">
                {{ formatDate(model.trainedAt) }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('mlModels.details.createdAt') }}
              </dt>
              <dd class="text-body-sm text-on-surface">
                {{ formatDate(model.createdAt) }}
              </dd>
            </div>

            <div class="bg-on-surface/[0.03] p-md rounded-lg sm:col-span-2">
              <dt class="text-body-x-sm text-on-surface-dim mb-xx-sm font-medium uppercase tracking-wider">
                {{ $t('mlModels.details.updatedAt') }}
              </dt>
              <dd class="text-body-sm text-on-surface">
                {{ formatDate(model.updatedAt) }}
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
