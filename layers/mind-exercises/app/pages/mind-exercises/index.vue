<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath() as unknown as (path: string) => string;

definePageMeta({
  layout: 'mind-exercises',
  title: 'mindExercises.hub.pageTitle',
});
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg">
      <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
        {{ t('mindExercises.hub.title') }}
      </h1>
      <p class="text-body-md mt-xx-sm text-on-surface-dim max-w-[64rem]">
        {{ t('mindExercises.hub.subtitle') }}
      </p>
    </section>

    <div class="gap-x-lg gap-y-lg grid sm:grid-cols-2">
      <NuxtLink
        :to="localePath('/mind-exercises/slide-block')"
        class="glass-card p-md sm:p-x-lg hover:border-on-surface-inverted/40 group border border-transparent transition-colors"
      >
        <div class="gap-md flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
              {{ t('mindExercises.blockSlide.kicker') }}
            </p>
            <h2 class="text-heading-md text-on-surface font-display font-bold">
              {{ t('mindExercises.hub.cardBlockSlideTitle') }}
            </h2>
            <p class="text-body-sm text-on-surface/90 mt-x-sm font-medium leading-relaxed">
              {{ t('mindExercises.hub.cardBlockSlideLead') }}
            </p>
            <p class="text-body-sm text-on-surface-dim mt-x-sm max-w-[48rem] leading-relaxed">
              {{ t('mindExercises.hub.cardBlockSlideDescription') }}
            </p>
          </div>
          <Icon
            name="lucide:move-horizontal"
            size="2.4rem"
            class="text-on-surface shrink-0 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg text-on-surface font-semibold">
          {{ t('mindExercises.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/mind-exercises/neuro-balance')"
        class="glass-card p-md sm:p-x-lg hover:border-on-surface-inverted/40 group border border-transparent transition-colors"
      >
        <div class="gap-md flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
              {{ t('mindExercises.neuroBalance.kicker') }}
            </p>
            <h2 class="text-heading-md text-on-surface font-display font-bold">
              {{ t('mindExercises.hub.cardNeuroBalanceTitle') }}
            </h2>
            <p class="text-body-sm text-on-surface/90 mt-x-sm font-medium leading-relaxed">
              {{ t('mindExercises.hub.cardNeuroBalanceLead') }}
            </p>
            <p class="text-body-sm text-on-surface-dim mt-x-sm max-w-[48rem] leading-relaxed">
              {{ t('mindExercises.hub.cardNeuroBalanceDescription') }}
            </p>
          </div>
          <Icon
            name="lucide:brain-circuit"
            size="2.4rem"
            class="text-on-surface shrink-0 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg text-on-surface font-semibold">
          {{ t('mindExercises.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/mind-exercises/forward-gate')"
        class="glass-card p-md sm:p-x-lg hover:border-on-surface-inverted/40 group border border-transparent transition-colors"
      >
        <div class="gap-md flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
              {{ t('mindExercises.forwardGate.kicker') }}
            </p>
            <h2 class="text-heading-md text-on-surface font-display font-bold">
              {{ t('mindExercises.hub.cardForwardGateTitle') }}
            </h2>
            <p class="text-body-sm text-on-surface/90 mt-x-sm font-medium leading-relaxed">
              {{ t('mindExercises.hub.cardForwardGateLead') }}
            </p>
            <p class="text-body-sm text-on-surface-dim mt-x-sm max-w-[48rem] leading-relaxed">
              {{ t('mindExercises.hub.cardForwardGateDescription') }}
            </p>
          </div>
          <Icon
            name="lucide:milestone"
            size="2.4rem"
            class="text-on-surface shrink-0 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg text-on-surface font-semibold">
          {{ t('mindExercises.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
