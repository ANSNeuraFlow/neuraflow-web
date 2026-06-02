<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useSsvepDetection } from '../../composables/useSsvepDetection';
import { loadStoredRefreshRate } from '../../utils/refresh-rate.utils';

const refreshRate = ref(loadStoredRefreshRate() ?? 60);
const showDebug = ref(false);
const { frequencyScores, currentCommand } = useSsvepDetection();

definePageMeta({
  layout: 'default',
  title: 'ssvep.test.pageTitle',
});
</script>

<template>
  <div class="gap-x-lg p-md mx-auto flex w-full max-w-[120rem] flex-col">
    <SsvepRefreshRateSelector v-model="refreshRate" />

    <SsvepSessionPanel :refresh-rate="refreshRate" />

    <div class="gap-x-lg lg:grid lg:grid-cols-[1fr_20rem]">
      <div class="glass-card p-sm relative min-h-[28rem] overflow-hidden">
        <SsvepStimuli
          :refresh-rate="refreshRate"
          :show-debug="showDebug"
        />
      </div>
      <SsvepFrequencyDisplay
        :scores="frequencyScores"
        :refresh-rate="refreshRate"
        :active-command="currentCommand"
      />
    </div>

    <label class="text-body-sm text-on-surface-dim gap-xs flex items-center">
      <input
        v-model="showDebug"
        type="checkbox"
        class="rounded"
      />
      {{ $t('ssvep.test.showTimingDebug') }}
    </label>
  </div>
</template>
