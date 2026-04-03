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
  <div class="min-h-screen bg-dark-900 font-sans text-white">
    <div
      class="noise-overlay"
      aria-hidden="true"
    />
    <a
      href="#main-content"
      class="focus:left-md focus:top-md focus:px-md focus:py-sm focus:text-body-sm sr-only focus:not-sr-only focus:fixed focus:z-50 focus:rounded-lg focus:bg-neural-600 focus:font-medium focus:text-white"
    >
      Skip to main content
    </a>
    <LandingHeader />
    <main id="main-content">
      <LandingHero />
      <LandingHighlights />
      <LandingCapabilities />
      <LandingHowItWorks />
      <LandingTechStack />
      <LandingContact />
    </main>
    <LandingFooter />
  </div>
</template>
