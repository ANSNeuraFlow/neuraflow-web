<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const { t } = useI18n();

definePageMeta({
  layout: false,
});

useHead({
  title: t('landing.meta.title'),
  meta: [
    {
      name: 'description',
      content: t('landing.meta.description'),
    },
  ],
});
</script>

<template>
  <main class="bg-surface text-on-surface">
    <LandingHeader />
    <LandingHero />
    <LandingHighlights />
    <LandingCapabilities />
    <LandingHowItWorks />
    <LandingTechStack />
    <LandingContact />
    <LandingFooter />
  </main>
</template>
