<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { loadStoredRefreshRate } from '../../utils/refresh-rate.utils';

const { t } = useI18n();
const localePath = useLocalePath();
const refreshRate = ref(loadStoredRefreshRate() ?? 60);

definePageMeta({
  layout: 'default',
  title: 'ssvep.landing.pageTitle',
});
</script>

<template>
  <div class="p-md mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg">
      <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
        {{ t('ssvep.landing.title') }}
      </h1>
      <p class="text-body-md mt-xx-sm text-on-surface-dim max-w-[64rem]">
        {{ t('ssvep.landing.subtitle') }}
      </p>
    </section>

    <SsvepRefreshRateSelector
      v-model="refreshRate"
      class="mb-x-lg"
    />

    <div class="gap-x-lg gap-y-lg grid sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        :to="localePath('/ssvep/test')"
        class="glass-card p-md hover:border-accent/40 sm:p-x-lg group border border-transparent transition-colors"
      >
        <Icon
          name="lucide:play"
          size="2.4rem"
          class="text-accent mb-sm"
        />
        <h2 class="text-heading-md text-on-surface font-display font-bold">
          {{ t('ssvep.landing.testTitle') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-x-sm">
          {{ t('ssvep.landing.testDescription') }}
        </p>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/ssvep/calibration')"
        class="glass-card p-md hover:border-accent/40 sm:p-x-lg group border border-transparent transition-colors"
      >
        <Icon
          name="lucide:target"
          size="2.4rem"
          class="text-accent mb-sm"
        />
        <h2 class="text-heading-md text-on-surface font-display font-bold">
          {{ t('ssvep.landing.calibrationTitle') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-x-sm">
          {{ t('ssvep.landing.calibrationDescription') }}
        </p>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/movement-exercises/ssvep-focus')"
        class="glass-card p-md hover:border-accent/40 sm:p-x-lg group border border-transparent transition-colors"
      >
        <Icon
          name="lucide:rocket"
          size="2.4rem"
          class="text-accent mb-sm"
        />
        <h2 class="text-heading-md text-on-surface font-display font-bold">
          {{ t('ssvep.landing.gameTitle') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-x-sm">
          {{ t('ssvep.landing.gameDescription') }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
