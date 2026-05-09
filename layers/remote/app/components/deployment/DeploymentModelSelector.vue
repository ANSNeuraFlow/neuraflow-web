<script setup lang="ts">
import type { MlModel } from '#layers/ml-models/app/models/ml-model.domain';

defineProps<{
  models: MlModel[];
  isLoading: boolean;
  selectedModelId: string | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  select: [model: MlModel];
}>();

const { t, locale } = useI18n();

const formatAccuracy = (v: number | null) => (v !== null ? `${(v * 100).toFixed(1)}%` : '—');

const accuracyClass = (v: number | null): string => {
  if (v === null) return 'bg-on-surface/10 text-on-surface-dim';
  if (v >= 0.9) return 'bg-success/15 text-success';
  if (v >= 0.75) return 'bg-warning/15 text-warning';
  return 'bg-error/15 text-error';
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return t('remote.deployment.modelSelector.unknownDate');
  return new Date(dateStr).toLocaleDateString(locale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
</script>

<template>
  <div
    v-if="isLoading"
    class="gap-sm grid grid-cols-1 sm:grid-cols-2"
    aria-busy="true"
  >
    <div
      v-for="i in 4"
      :key="i"
      class="bg-on-surface/[0.05] h-[8.8rem] animate-pulse rounded-2xl"
    />
  </div>

  <div
    v-else-if="models.length === 0"
    class="border-warning/25 bg-warning/[0.04] px-x-lg py-x-lg rounded-2xl border border-dashed text-center"
  >
    <div class="bg-warning/10 mb-sm mx-auto flex h-[5.2rem] w-[5.2rem] items-center justify-center rounded-full">
      <Icon
        name="material-symbols:model-training-outline"
        size="2.8rem"
        class="text-warning"
      />
    </div>
    <p class="text-body-md text-on-surface font-semibold">
      {{ t('remote.deployment.panel.noModels.title') }}
    </p>
    <p class="text-body-sm text-on-surface-dim mt-xx-sm mx-auto max-w-[36rem]">
      {{ t('remote.deployment.panel.noModels.body') }}
    </p>
  </div>

  <div
    v-else
    class="gap-sm grid grid-cols-1 sm:grid-cols-2"
    role="radiogroup"
    :aria-label="t('remote.deployment.panel.selectModel')"
  >
    <button
      v-for="model in models"
      :key="model.id"
      type="button"
      role="radio"
      :aria-checked="selectedModelId === model.id"
      :disabled="disabled"
      :class="[
        'group relative rounded-2xl border text-left transition-all duration-200',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        selectedModelId === model.id
          ? 'border-on-surface bg-on-surface/[0.06] ring-on-surface/25 shadow-sm ring-1'
          : disabled
            ? 'border-on-surface/[0.06] bg-on-surface/[0.02] opacity-70'
            : 'border-on-surface/[0.08] bg-on-surface/[0.02] hover:border-on-surface/20 hover:bg-on-surface/[0.05]',
      ]"
      @click="!disabled && emit('select', model)"
    >
      <div class="p-md gap-sm flex items-start">
        <div
          :class="[
            'flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-xl transition-colors',
            selectedModelId === model.id
              ? 'bg-on-surface text-surface'
              : 'bg-on-surface/[0.06] text-on-surface-dim group-hover:bg-on-surface/10 group-hover:text-on-surface',
          ]"
        >
          <Icon
            name="material-symbols:neurology"
            size="2.2rem"
          />
        </div>

        <div class="py-xx-sm min-w-0 flex-1">
          <p class="text-body-md text-on-surface truncate font-semibold leading-tight">
            {{ model.name }}
          </p>
          <p class="text-body-x-sm text-on-surface-dim mt-xx-sm">
            {{ t('remote.deployment.modelSelector.trainedOn') }}
            {{ formatDate(model.trainedAt) }}
          </p>
        </div>

        <div class="gap-xs pt-xx-sm flex shrink-0 flex-col items-end">
          <span :class="['px-xs py-x-tiny text-body-x-sm rounded-full font-bold', accuracyClass(model.accuracy)]">
            {{ formatAccuracy(model.accuracy) }}
          </span>
          <Icon
            v-if="selectedModelId === model.id"
            name="material-symbols:check-circle"
            size="1.8rem"
            class="text-on-surface"
          />
        </div>
      </div>
    </button>
  </div>
</template>
