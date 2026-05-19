<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

definePageMeta({
  layout: 'movement-exercises',
  title: 'movementExercises.hub.pageTitle',
});
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg">
      <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
        {{ t('movementExercises.hub.title') }}
      </h1>
      <p class="text-body-md mt-xx-sm text-on-surface-dim max-w-[64rem]">
        {{ t('movementExercises.hub.subtitle') }}
      </p>
    </section>

    <div class="gap-x-lg gap-y-lg grid sm:grid-cols-2">
      <NuxtLink
        :to="localePath('/movement-exercises/slide-block')"
        class="glass-card p-md sm:p-x-lg hover:border-on-surface-inverted/40 group border border-transparent transition-colors"
      >
        <div class="gap-md flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
              {{ t('movementExercises.blockSlide.kicker') }}
            </p>
            <h2 class="text-heading-md text-on-surface font-display font-bold">
              {{ t('movementExercises.hub.cardBlockSlideTitle') }}
            </h2>
            <p class="text-body-sm text-on-surface/90 mt-x-sm font-medium leading-relaxed">
              {{ t('movementExercises.hub.cardBlockSlideLead') }}
            </p>
            <p class="text-body-sm text-on-surface-dim mt-x-sm max-w-[48rem] leading-relaxed">
              {{ t('movementExercises.hub.cardBlockSlideDescription') }}
            </p>
          </div>
          <Icon
            name="lucide:move-horizontal"
            size="2.4rem"
            class="text-on-surface shrink-0 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg text-on-surface font-semibold">
          {{ t('movementExercises.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/movement-exercises/neuro-balance')"
        class="glass-card p-md sm:p-x-lg hover:border-on-surface-inverted/40 group border border-transparent transition-colors"
      >
        <div class="gap-md flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
              {{ t('movementExercises.neuroBalance.kicker') }}
            </p>
            <h2 class="text-heading-md text-on-surface font-display font-bold">
              {{ t('movementExercises.hub.cardNeuroBalanceTitle') }}
            </h2>
            <p class="text-body-sm text-on-surface/90 mt-x-sm font-medium leading-relaxed">
              {{ t('movementExercises.hub.cardNeuroBalanceLead') }}
            </p>
            <p class="text-body-sm text-on-surface-dim mt-x-sm max-w-[48rem] leading-relaxed">
              {{ t('movementExercises.hub.cardNeuroBalanceDescription') }}
            </p>
          </div>
          <Icon
            name="lucide:brain-circuit"
            size="2.4rem"
            class="text-on-surface shrink-0 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg text-on-surface font-semibold">
          {{ t('movementExercises.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/movement-exercises/forward-gate')"
        class="glass-card p-md sm:p-x-lg hover:border-on-surface-inverted/40 group border border-transparent transition-colors"
      >
        <div class="gap-md flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
              {{ t('movementExercises.forwardGate.kicker') }}
            </p>
            <h2 class="text-heading-md text-on-surface font-display font-bold">
              {{ t('movementExercises.hub.cardForwardGateTitle') }}
            </h2>
            <p class="text-body-sm text-on-surface/90 mt-x-sm font-medium leading-relaxed">
              {{ t('movementExercises.hub.cardForwardGateLead') }}
            </p>
            <p class="text-body-sm text-on-surface-dim mt-x-sm max-w-[48rem] leading-relaxed">
              {{ t('movementExercises.hub.cardForwardGateDescription') }}
            </p>
          </div>
          <Icon
            name="lucide:milestone"
            size="2.4rem"
            class="text-on-surface shrink-0 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg text-on-surface font-semibold">
          {{ t('movementExercises.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
