<script setup lang="ts">
const { t } = useI18n();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

const navItems = computed(() => [
  { href: '#features', label: t('landing.nav.features') },
  { href: '#how-it-works', label: t('landing.nav.howItWorks') },
  { href: '#tech', label: t('landing.nav.technology') },
  { href: '#stats', label: t('landing.nav.stats') },
]);

const handleScroll = (): void => {
  isScrolled.value = window.scrollY > 20;
};

const handleLogoClick = (): void => {
  isMobileMenuOpen.value = false;
};

const handleMobileMenuToggle = (): void => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMenu = (): void => {
  isMobileMenuOpen.value = false;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header
    class="fixed left-0 right-0 top-0 z-50 transition-all duration-300"
    :class="isScrolled ? 'border-b border-white/[0.06] bg-dark-900/90 backdrop-blur-xl' : 'bg-transparent'"
  >
    <div class="px-md sm:px-x-lg lg:px-xx-lg mx-auto w-full max-w-landing">
      <div class="min-h-x-huge py-sm relative flex items-center justify-between">
        <!-- Logo -->
        <a
          href="#home"
          class="gap-md group relative z-10 flex shrink-0 items-center"
          :aria-label="t('landing.hero.badge')"
          @click="handleLogoClick"
        >
          <div class="h-x-huge w-x-huge relative">
            <div
              class="absolute inset-0 rounded-lg bg-neural-500 opacity-70 blur-sm transition-opacity group-hover:opacity-100"
            />
            <div
              class="h-x-huge w-x-huge relative flex items-center justify-center rounded-lg bg-gradient-to-br from-neural-500 to-neural-700"
            >
              <svg
                class="h-x-lg w-x-lg text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"
                />
                <path
                  d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"
                />
              </svg>
            </div>
          </div>
          <span class="text-body-lg tracking-sm font-display font-bold text-white">
            Neura<span class="gradient-text">Flow</span>
          </span>
        </a>

        <!-- Desktop nav (centered in bar — avoids overlap when container uses px max-width) -->
        <nav
          class="gap-x-sm lg:gap-md xl:gap-x-lg absolute left-1/2 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 items-center md:flex"
          role="navigation"
          :aria-label="t('landing.nav.openMenu')"
        >
          <a
            v-for="item in navItems"
            :key="item.href"
            :href="item.href"
            class="px-sm py-sm text-body-sm duration-short lg:px-md shrink-0 whitespace-nowrap rounded-lg font-medium text-slate-400 transition-colors ease-out hover:bg-white/[0.05] hover:text-white"
          >
            {{ item.label }}
          </a>
        </nav>

        <!-- Desktop CTA -->
        <div class="gap-sm lg:gap-md relative z-10 ml-auto hidden shrink-0 items-center md:flex">
          <button
            class="btn-secondary px-md py-xx-sm text-body-sm font-semibold"
            :aria-label="t('landing.nav.login')"
            @click="navigateTo('/login')"
          >
            {{ t('landing.nav.login') }}
          </button>
          <button
            class="btn-primary px-md py-xx-sm text-body-sm font-semibold"
            :aria-label="t('landing.nav.register')"
            @click="navigateTo('/register')"
          >
            {{ t('landing.nav.register') }}
          </button>
        </div>

        <!-- Mobile hamburger -->
        <button
          class="p-sm duration-short relative z-10 ml-auto shrink-0 rounded-lg text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white md:hidden"
          :aria-label="isMobileMenuOpen ? t('landing.nav.closeMenu') : t('landing.nav.openMenu')"
          :aria-expanded="isMobileMenuOpen"
          @click="handleMobileMenuToggle"
        >
          <svg
            v-if="!isMobileMenuOpen"
            class="h-x-lg w-x-lg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <svg
            v-else
            class="h-x-lg w-x-lg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div
        v-if="isMobileMenuOpen"
        class="border-t border-white/[0.06] bg-dark-900/95 backdrop-blur-xl md:hidden"
      >
        <nav
          class="gap-xx-sm px-md py-md mx-auto flex w-full max-w-landing flex-col"
          role="navigation"
          :aria-label="t('landing.nav.openMenu')"
        >
          <a
            v-for="item in navItems"
            :key="item.href"
            :href="item.href"
            class="px-md py-md text-body-sm duration-short rounded-lg font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
            @click="closeMenu"
          >
            {{ item.label }}
          </a>
          <div class="mt-md gap-sm pt-md flex flex-col border-t border-white/[0.06]">
            <button
              class="btn-secondary w-full justify-center"
              @click="navigateTo('/login')"
            >
              {{ t('landing.nav.login') }}
            </button>
            <button
              class="btn-primary w-full justify-center"
              @click="navigateTo('/register')"
            >
              {{ t('landing.nav.register') }}
            </button>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
