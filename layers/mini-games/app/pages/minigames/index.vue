<script setup lang="ts">
defineOptions({ name: 'MinigamesHubPage' });

const { t } = useI18n();
const localePath = useLocalePath();

definePageMeta({
  layout: 'minigames-layout',
  title: 'minigames.hub.pageTitle',
});
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg">
      <div class="gap-sm flex flex-wrap items-start justify-between">
        <div>
          <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
            {{ t('minigames.hub.kicker') }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ t('minigames.hub.title') }}
          </h1>
          <p class="text-body-md text-on-surface-dim mt-x-sm max-w-[64rem]">
            {{ t('minigames.hub.subtitle') }}
          </p>
        </div>
        <Icon
          name="lucide:gamepad-2"
          size="2.4rem"
          class="text-on-surface shrink-0"
        />
      </div>
    </section>

    <div class="gap-x-lg gap-y-lg grid sm:grid-cols-2">
      <NuxtLink
        :to="localePath('/minigames/dodge')"
        class="glass-card p-md sm:p-x-lg hover:border-on-surface/30 group border border-transparent transition-colors"
      >
        <div class="gap-md flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-body-x-sm mb-xx-sm text-on-surface font-semibold uppercase tracking-wider">
              {{ t('minigames.dodge.kicker') }}
            </p>
            <h2 class="text-heading-md text-on-surface font-display font-bold">
              {{ t('minigames.hub.cardDodgeTitle') }}
            </h2>
            <p class="text-body-sm text-on-surface/90 mt-x-sm font-medium leading-relaxed">
              {{ t('minigames.hub.cardDodgeLead') }}
            </p>
            <p class="text-body-sm text-on-surface-dim mt-x-sm max-w-[48rem] leading-relaxed">
              {{ t('minigames.hub.cardDodgeDescription') }}
            </p>
          </div>
          <Icon
            name="lucide:rocket"
            size="2.4rem"
            class="text-on-surface shrink-0 transition-transform group-hover:scale-110"
          />
        </div>
        <p class="text-body-sm mt-x-lg text-on-surface font-semibold">
          {{ t('minigames.hub.open') }}
          <span aria-hidden="true"> →</span>
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
