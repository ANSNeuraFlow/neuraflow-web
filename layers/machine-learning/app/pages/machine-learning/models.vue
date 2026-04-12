<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  layout: 'machine-learning',
  title: 'machineLearning.models.pageTitle',
});
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-accent/5 pointer-events-none absolute -right-20 -top-20 h-[200px] w-[200px] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div class="relative z-10">
        <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
          {{ $t('machineLearning.models.kicker') }}
        </p>
        <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
          {{ $t('machineLearning.models.title') }}
        </h1>
        <p class="text-body-md mt-xx-sm text-on-surface-dim">
          {{ $t('machineLearning.models.subtitle') }}
        </p>
      </div>
    </section>

    <div class="glass-card p-md sm:p-x-lg">
      <p class="text-body-md text-on-surface-dim">Tutaj znajdą się wytrenowane modele uczenia maszynowego.</p>
    </div>
  </div>
</template>
