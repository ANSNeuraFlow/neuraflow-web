<script setup lang="ts">
import { useBciCalibration } from '../../composables/useBciCalibration';

definePageMeta({
  layout: 'machine-learning',
  title: 'BCI Calibration | NeuraFlow',
});

const { currentState } = useBciCalibration();
</script>

<template>
  <div class="h-full w-full">
    <div
      v-if="currentState === 'idle' || currentState === 'finished'"
      class="mb-lg flex items-center justify-between"
    >
      <div>
        <h1 class="text-heading-lg text-on-surface font-display font-bold">BCI Graz Protocol Calibration</h1>
        <p class="text-on-surface-dim text-body-lg">Motor Imagery Standard Paradigm (8-second trial loop)</p>
      </div>
    </div>

    <BciCalibrationUI />
  </div>
</template>
