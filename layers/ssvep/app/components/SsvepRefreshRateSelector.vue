<script setup lang="ts">
import { SSVEP_REFRESH_RATES } from '../constants/ssvep.const';
import {
  buildFrequencySetForRefreshRate,
  detectRefreshRate,
  loadStoredRefreshRate,
  saveRefreshRate,
} from '../utils/refresh-rate.utils';

const model = defineModel<number>({ required: true });

const { t } = useI18n();

onMounted(() => {
  const stored = loadStoredRefreshRate();
  if (stored) model.value = stored;
});

watch(model, (v) => saveRefreshRate(v));

const frequencyPreview = computed(() => buildFrequencySetForRefreshRate(model.value));

const applyAutoDetect = () => {
  model.value = detectRefreshRate();
};
</script>

<template>
  <div class="glass-card gap-md p-md sm:p-x-lg flex flex-col">
    <div>
      <h3 class="text-heading-sm text-on-surface font-display font-bold">
        {{ t('ssvep.refreshRate.title') }}
      </h3>
      <p class="text-body-sm text-on-surface-dim mt-xx-sm max-w-[48rem]">
        {{ t('ssvep.refreshRate.description') }}
      </p>
    </div>

    <div class="gap-sm flex flex-wrap items-center">
      <AppButton
        variant="secondary"
        size="sm"
        @click="applyAutoDetect"
      >
        <Icon
          name="material-symbols:monitor-outline"
          size="1.6rem"
          class="mr-xs"
        />
        {{ t('ssvep.refreshRate.autoDetect') }}
      </AppButton>
    </div>

    <div
      class="gap-sm grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
      role="radiogroup"
      :aria-label="t('ssvep.refreshRate.title')"
    >
      <label
        v-for="rate in SSVEP_REFRESH_RATES"
        :key="rate"
        class="gap-xx-sm px-sm py-xs flex cursor-pointer items-center rounded-md border transition-colors"
        :class="model === rate ? 'border-accent bg-accent/10' : 'border-on-surface/[0.12] hover:border-on-surface/30'"
      >
        <input
          v-model="model"
          type="radio"
          class="sr-only"
          :value="rate"
        />
        <span class="text-body-sm text-on-surface font-medium">{{ rate }} Hz</span>
      </label>
    </div>

    <div class="gap-xs flex flex-wrap">
      <span
        v-for="entry in frequencyPreview"
        :key="entry.direction"
        class="text-body-x-sm px-sm py-xx-xs rounded-full font-medium"
        :class="{
          'bg-success/15 text-success': entry.quality === 'optimal',
          'bg-accent/15 text-accent': entry.quality === 'good',
          'bg-warning/15 text-warning': entry.quality === 'warning',
        }"
      >
        {{ entry.direction }}: {{ entry.frequency }} Hz
      </span>
    </div>
  </div>
</template>
