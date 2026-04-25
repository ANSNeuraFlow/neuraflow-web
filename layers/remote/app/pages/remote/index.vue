<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

definePageMeta({
  layout: 'remote',
  title: 'remote.hub.pageTitle',
});
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg">
      <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
        {{ t('remote.hub.title') }}
      </h1>
      <p class="text-body-md mt-xx-sm text-on-surface-dim max-w-[64rem]">
        {{ t('remote.hub.subtitle') }}
      </p>
    </section>

    <div class="gap-x-lg gap-y-lg grid sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        :to="localePath('/remote/drone')"
        class="glass-card p-md sm:p-x-lg hover:border-on-surface-inverted/40 group border border-transparent transition-colors"
      >
        <div class="gap-md flex items-start justify-between">
          <div>
            <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
              {{ t('remote.dronePage.kicker') }}
            </p>
            <h2 class="text-heading-md text-on-surface font-display font-bold">
              {{ t('remote.hub.droneTitle') }}
            </h2>
            <p class="text-body-sm mt-x-sm text-on-surface-dim">
              {{ t('remote.hub.droneDescription') }}
            </p>
          </div>
          <Icon
            name="mdi:quadcopter"
            size="2.4rem"
            class="text-on-surface shrink-0 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg text-on-surface font-semibold">
          {{ t('remote.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/remote/car')"
        class="glass-card p-md sm:p-x-lg hover:border-on-surface-inverted/40 group border border-transparent transition-colors"
      >
        <div class="gap-md flex items-start justify-between">
          <div>
            <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
              {{ t('remote.carPage.kicker') }}
            </p>
            <h2 class="text-heading-md text-on-surface font-display font-bold">
              {{ t('remote.hub.carTitle') }}
            </h2>
            <p class="text-body-sm mt-x-sm text-on-surface-dim">
              {{ t('remote.hub.carDescription') }}
            </p>
          </div>
          <Icon
            name="lucide:car"
            size="2.4rem"
            class="text-on-surface shrink-0 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg text-on-surface font-semibold">
          {{ t('remote.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/remote/eeg')"
        class="glass-card p-md sm:p-x-lg hover:border-on-surface-inverted/40 group border border-transparent transition-colors"
      >
        <div class="gap-md flex items-start justify-between">
          <div>
            <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
              {{ t('remote.eeg.kicker') }}
            </p>
            <h2 class="text-heading-md text-on-surface font-display font-bold">
              {{ t('remote.hub.eegTitle') }}
            </h2>
            <p class="text-body-sm mt-x-sm text-on-surface-dim">
              {{ t('remote.hub.eegDescription') }}
            </p>
          </div>
          <Icon
            name="lucide:brain-circuit"
            size="2.4rem"
            class="text-on-surface shrink-0 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg text-on-surface font-semibold">
          {{ t('remote.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
