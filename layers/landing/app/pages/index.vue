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
  <div
    class="bg-surface text-on-surface selection:bg-on-surface/10 min-h-screen font-sans transition-colors duration-500"
  >
    <div
      class="noise-overlay"
      aria-hidden="true"
    />
    <a
      href="#main-content"
      class="focus:left-md focus:top-md focus:px-md focus:py-sm focus:text-body-sm focus:bg-on-surface focus:text-surface sr-only focus:not-sr-only focus:fixed focus:z-50 focus:rounded-xl focus:font-medium"
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
