<script setup lang="ts">
const { t } = useI18n();

const currentYear = new Date().getFullYear();

const footerLinks = computed(() => [
  { href: '#features', label: t('landing.footer.links.features') },
  { href: '#how-it-works', label: t('landing.footer.links.howItWorks') },
  { href: '#tech', label: t('landing.footer.links.tech') },
  { href: 'http://localhost:4000/api-docs', label: t('landing.footer.links.apiDocs') },
]);
</script>

<template>
  <footer
    class="py-xx-lg relative border-t border-white/[0.06]"
    role="contentinfo"
    aria-label="NeuraFlow footer"
  >
    <div class="px-md sm:px-x-lg lg:px-xx-lg mx-auto w-full max-w-landing">
      <div class="gap-xx-lg flex flex-col items-center justify-between md:flex-row">
        <!-- Logo & tagline -->
        <div class="gap-md flex items-center">
          <div
            class="h-x-huge w-x-huge flex items-center justify-center rounded-lg bg-gradient-to-br from-neural-500 to-neural-700"
            aria-hidden="true"
          >
            <svg
              class="h-md w-md text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 011.98-3A2.5 2.5 0 019.5 2Z"
              />
              <path
                d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-1.98-3A2.5 2.5 0 0014.5 2Z"
              />
            </svg>
          </div>
          <div>
            <span class="text-body-md font-display font-semibold text-white">
              Neura<span class="gradient-text">Flow</span>
            </span>
            <p class="text-body-x-sm text-slate-600">{{ t('landing.footer.tagline') }}</p>
          </div>
        </div>

        <!-- Links -->
        <nav
          class="gap-xx-lg flex flex-wrap items-center"
          :aria-label="t('landing.nav.openMenu')"
        >
          <a
            v-for="link in footerLinks"
            :key="link.label"
            :href="link.href"
            class="text-body-sm duration-short text-slate-500 transition-colors hover:text-slate-300"
          >
            {{ link.label }}
          </a>
        </nav>

        <!-- Copyright -->
        <p
          class="text-body-x-sm text-slate-600"
          aria-label="Copyright"
        >
          © {{ currentYear }} {{ t('landing.footer.copyright') }}
        </p>
      </div>

      <!-- API status bar -->
      <div class="mt-xx-lg gap-xx-lg pt-xx-lg flex flex-wrap items-center border-t border-white/[0.04]">
        <div class="gap-sm text-body-x-sm flex items-center text-slate-600">
          <span aria-hidden="true">{{ t('landing.footer.apiLabel') }}</span>
          <code class="text-body-x-sm font-mono text-slate-500">{{ t('landing.footer.apiEndpoint') }}</code>
        </div>
        <div class="gap-sm text-body-x-sm flex items-center text-slate-600">
          <div
            class="h-1.5 w-1.5 rounded-full bg-green-400"
            aria-hidden="true"
          />
          <span>{{ t('landing.footer.apiDocsAvailable') }}</span>
        </div>
        <div class="gap-sm text-body-x-sm flex items-center text-slate-600">
          <span>NestJS</span>
          <span class="text-slate-700">•</span>
          <span>PostgreSQL</span>
          <span class="text-slate-700">•</span>
          <span>Kafka</span>
          <span class="text-slate-700">•</span>
          <span>Ray</span>
        </div>
      </div>
    </div>
  </footer>
</template>
