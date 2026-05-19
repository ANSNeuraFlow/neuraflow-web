<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const { t } = useI18n();

definePageMeta({
  layout: 'focus-exercises',
  title: 'focusExercises.hub.pageTitle',
});
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card p-md sm:p-x-lg">
      <div class="gap-sm flex flex-wrap items-start justify-between">
        <div>
          <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
            {{ t('focusExercises.hub.kicker') }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ t('focusExercises.hub.title') }}
          </h1>
          <p class="text-body-md text-on-surface-dim mt-x-sm max-w-[72rem]">
            {{ t('focusExercises.hub.subtitle') }}
          </p>
        </div>
        <Icon
          name="lucide:focus"
          size="2.8rem"
          class="text-on-surface/60 shrink-0"
        />
      </div>
    </section>
  </div>
</template>
