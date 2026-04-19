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
        class="glass-card p-md sm:p-x-lg group border border-transparent transition-colors hover:border-neural-500/40"
      >
        <div class="gap-md flex items-start justify-between">
          <div>
            <p class="text-body-x-sm mb-xx-sm font-semibold uppercase tracking-wider text-neural-400">
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
            name="material-symbols:flight"
            size="2.4rem"
            class="shrink-0 text-neural-400 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg font-semibold text-neural-400">
          {{ t('remote.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/remote/car')"
        class="glass-card p-md sm:p-x-lg group border border-transparent transition-colors hover:border-neural-500/40"
      >
        <div class="gap-md flex items-start justify-between">
          <div>
            <p class="text-body-x-sm mb-xx-sm font-semibold uppercase tracking-wider text-neural-400">
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
            name="material-symbols:directions-car"
            size="2.4rem"
            class="shrink-0 text-neural-400 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg font-semibold text-neural-400">
          {{ t('remote.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/remote/eeg')"
        class="glass-card p-md sm:p-x-lg group border border-transparent transition-colors hover:border-neural-500/40 sm:col-span-2 lg:col-span-1"
      >
        <div class="gap-md flex items-start justify-between">
          <div>
            <p class="text-body-x-sm mb-xx-sm font-semibold uppercase tracking-wider text-neural-400">
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
            name="material-symbols:monitor-heart"
            size="2.4rem"
            class="shrink-0 text-neural-400 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg font-semibold text-neural-400">
          {{ t('remote.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
