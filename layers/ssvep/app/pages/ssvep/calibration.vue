<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'ssvep.calibration.pageTitle',
});
</script>

<template>
  <div class="p-md mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg">
      <h1 class="text-heading-lg text-on-surface font-display font-bold">
        {{ $t('ssvep.calibration.pageTitle') }}
      </h1>
      <p class="text-body-md text-on-surface-dim mt-xx-sm">
        {{ $t('ssvep.calibration.pageSubtitle') }}
      </p>
    </section>
    <SsvepCalibrationUI />
  </div>
</template>
