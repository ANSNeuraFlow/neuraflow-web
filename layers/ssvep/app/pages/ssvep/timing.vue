<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
/**
 * Dev timing validation: measured FPS vs target refresh rate.
 */
import { loadStoredRefreshRate } from '../../utils/refresh-rate.utils';

const refreshRate = ref(loadStoredRefreshRate() ?? 60);
const showDebug = ref(true);

definePageMeta({
  layout: 'default',
  title: 'ssvep.test.pageTitle',
});
</script>

<template>
  <div class="p-md mx-auto w-full max-w-[120rem]">
    <SsvepRefreshRateSelector v-model="refreshRate" />
    <SsvepSessionPanel :refresh-rate="refreshRate" />
    <div class="glass-card mt-x-lg relative min-h-[32rem]">
      <SsvepStimuli
        :refresh-rate="refreshRate"
        :show-debug="showDebug"
      />
    </div>
  </div>
</template>
