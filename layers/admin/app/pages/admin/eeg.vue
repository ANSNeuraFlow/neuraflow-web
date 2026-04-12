<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  requiredPermissions: ['VIEW_ADMIN_PANEL'],
  title: 'admin.eeg.title',
});
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg">
      <div class="gap-sm flex flex-wrap items-start justify-between">
        <div>
          <p class="text-body-x-sm mb-xx-sm font-semibold uppercase tracking-wider text-neural-400">
            {{ $t('admin.eeg.kicker') }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ $t('admin.eeg.title') }}
          </h1>
          <p class="text-body-md mt-xx-sm text-on-surface-dim">
            {{ $t('admin.eeg.subtitle') }}
          </p>
        </div>
        <Icon
          name="material-symbols:monitor-heart"
          size="2.4rem"
          class="text-neural-400"
        />
      </div>
    </section>

    <EegDisplayGrid />
  </div>
</template>
