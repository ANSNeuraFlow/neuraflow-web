<script setup lang="ts">
const { t } = useI18n();

const productLinks = computed(() => [
  { href: '#highlights', label: t('landing.nav.highlights') },
  { href: '#capabilities', label: t('landing.nav.capabilities') },
  { href: '#how-it-works', label: t('landing.nav.howItWorks') },
  { href: '#technology', label: t('landing.nav.technology') },
]);
</script>

<template>
  <footer class="border-on-surface/8 bg-surface-container/50 border-t">
    <div class="gap-xx-lg px-md py-xx-lg lg:px-xx-lg container mx-auto grid grid-cols-1 lg:grid-cols-3">
      <div class="gap-md flex flex-col">
        <BrandLogo size="small" />
        <p class="text-body-sm text-on-surface-dim">
          {{ t('landing.footer.tagline') }}
        </p>
      </div>

      <div class="gap-sm flex flex-col">
        <h2 class="text-body-md text-on-surface font-semibold">
          {{ t('landing.footer.product') }}
        </h2>
        <a
          v-for="link in productLinks"
          :key="link.href"
          :href="link.href"
          class="text-body-sm text-on-surface-dim duration-short hover:text-on-surface w-fit transition-colors ease-out"
        >
          {{ link.label }}
        </a>
      </div>

      <div class="gap-sm flex flex-col">
        <h2 class="text-body-md text-on-surface font-semibold">
          {{ t('landing.footer.legal') }}
        </h2>
        <a
          href="#"
          class="text-body-sm text-on-surface-dim duration-short hover:text-on-surface w-fit transition-colors ease-out"
        >
          {{ t('landing.footer.privacy') }}
        </a>
        <a
          href="#"
          class="text-body-sm text-on-surface-dim duration-short hover:text-on-surface w-fit transition-colors ease-out"
        >
          {{ t('landing.footer.terms') }}
        </a>
      </div>
    </div>

    <div class="border-on-surface/8 px-md py-md text-body-x-sm text-on-surface-dim border-t">
      <p class="container mx-auto">{{ new Date().getFullYear() }} {{ t('landing.footer.copyright') }}</p>
    </div>
  </footer>
</template>
