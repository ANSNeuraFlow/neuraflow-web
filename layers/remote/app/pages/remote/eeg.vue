<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  layout: 'remote',
  title: 'remote.eeg.pageTitle',
});
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg">
      <div class="gap-sm flex flex-wrap items-start justify-between">
        <div>
          <p class="text-body-x-sm mb-xx-sm font-semibold uppercase tracking-wider text-neural-400">
            {{ $t('remote.eeg.kicker') }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ $t('remote.eeg.title') }}
          </h1>
          <p class="text-body-md mt-xx-sm text-on-surface-dim max-w-[64rem]">
            {{ $t('remote.eeg.subtitle') }}
          </p>
          <p class="text-body-sm text-on-surface-dim/80 mt-x-lg">
            {{ $t('remote.eeg.placeholder') }}
          </p>
        </div>
        <Icon
          name="material-symbols:monitor-heart"
          size="2.4rem"
          class="text-neural-400"
        />
      </div>
    </section>
  </div>
</template>
