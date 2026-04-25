<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';

const { t } = useI18n();
const localePath = useLocalePath();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const appsMenuOpen = ref(false);
const appsMenuRoot = ref<HTMLElement | null>(null);

onClickOutside(appsMenuRoot, () => {
  appsMenuOpen.value = false;
});

const navItems = computed(() => [
  { href: '/#features', label: t('landing.nav.features') },
  { href: '/#how-it-works', label: t('landing.nav.howItWorks') },
  { href: '/#tech', label: t('landing.nav.technology') },
  { href: '/#stats', label: t('landing.nav.stats') },
]);

const machineLearningNav = computed(() => ({
  to: localePath('/machine-learning'),
  label: t('landing.nav.machineLearning'),
}));

const remoteVehiclesNav = computed(() => ({
  to: localePath('/remote'),
  label: t('landing.nav.remoteVehicles'),
}));

const mindExercisesNav = computed(() => ({
  to: localePath('/mind-exercises'),
  label: t('landing.nav.mindExercises'),
}));

const navLinkClass =
  'px-sm py-sm text-body-sm duration-short lg:px-md text-on-surface-dim hover:bg-on-surface/5 hover:text-on-surface shrink-0 whitespace-nowrap rounded-lg font-medium transition-colors ease-out';

const navLinkClassMobile =
  'px-md py-md text-body-sm duration-short rounded-lg font-medium text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white';

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

const closeAppsMenu = (): void => {
  appsMenuOpen.value = false;
};

const toggleAppsMenu = (): void => {
  appsMenuOpen.value = !appsMenuOpen.value;
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
    class="fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300"
    :class="isScrolled ? 'border-on-surface/10 bg-surface/90 backdrop-blur-xl' : 'border-transparent bg-transparent'"
  >
    <div class="px-md sm:px-x-lg lg:px-xx-lg mx-auto w-full max-w-landing">
      <div class="min-h-x-huge py-sm gap-x-sm relative flex items-center justify-between">
        <!-- Logo -->
        <a
          href="/"
          class="gap-md group relative z-10 flex min-w-0 shrink-0 items-center"
          :aria-label="t('landing.hero.badge')"
          @click="handleLogoClick"
        >
          <div class="h-x-huge w-x-huge relative">
            <div
              class="bg-on-surface absolute inset-0 rounded-lg opacity-50 blur-sm transition-opacity group-hover:opacity-80"
            />
            <div
              class="h-x-huge w-x-huge from-on-surface-dim to-on-surface relative flex items-center justify-center rounded-lg bg-gradient-to-br"
            >
              <svg
                class="h-x-lg w-x-lg text-surface"
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
          <span class="text-body-lg tracking-sm text-on-surface font-display font-bold">
            Neura<span class="gradient-text">Flow</span>
          </span>
        </a>

        <nav
          class="text-body-x-sm lg:text-body-sm gap-x-sm lg:gap-x-md xl:gap-x-lg hidden min-w-0 flex-1 items-center justify-center md:flex"
          role="navigation"
          :aria-label="t('landing.nav.openMenu')"
        >
          <div
            class="gap-x-sm lg:gap-x-md xl:gap-x-lg flex min-w-0 max-w-full items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <a
              v-for="item in navItems"
              :key="item.href"
              :href="item.href"
              :class="navLinkClass"
            >
              {{ item.label }}
            </a>
          </div>
          <span
            class="bg-on-surface/10 mx-xx-sm hidden h-6 w-px shrink-0 md:block"
            aria-hidden="true"
          />
          <div
            ref="appsMenuRoot"
            class="relative z-[60] shrink-0"
          >
            <button
              type="button"
              class="gap-xx-sm px-sm py-sm text-body-sm duration-short lg:px-md text-on-surface-dim hover:bg-on-surface/5 hover:text-on-surface inline-flex shrink-0 items-center whitespace-nowrap rounded-lg font-medium transition-colors ease-out"
              :aria-expanded="appsMenuOpen"
              :aria-haspopup="true"
              :aria-label="t('landing.nav.appsSection')"
              @click.stop="toggleAppsMenu"
            >
              {{ t('landing.nav.appsSection') }}
              <Icon
                name="material-symbols:keyboard-arrow-down"
                size="1.25rem"
                class="transition-transform"
                :class="appsMenuOpen ? 'rotate-180' : ''"
                aria-hidden="true"
              />
            </button>
            <Transition name="fade-scale">
              <div
                v-if="appsMenuOpen"
                class="border-on-surface/10 bg-surface/95 py-xx-sm absolute left-1/2 top-[calc(100%+0.6rem)] z-[70] min-w-[14rem] -translate-x-1/2 rounded-xl border shadow-xl backdrop-blur-xl"
                role="menu"
              >
                <NuxtLink
                  :to="machineLearningNav.to"
                  role="menuitem"
                  class="px-md py-sm text-on-surface-dim hover:bg-on-surface/8 hover:text-on-surface block font-medium transition-colors"
                  active-class="!bg-on-surface/10 !text-on-surface"
                  @click="closeAppsMenu"
                >
                  {{ machineLearningNav.label }}
                </NuxtLink>
                <NuxtLink
                  :to="remoteVehiclesNav.to"
                  role="menuitem"
                  class="px-md py-sm text-on-surface-dim hover:bg-on-surface/8 hover:text-on-surface block font-medium transition-colors"
                  active-class="!bg-on-surface/10 !text-on-surface"
                  @click="closeAppsMenu"
                >
                  {{ remoteVehiclesNav.label }}
                </NuxtLink>
                <NuxtLink
                  :to="mindExercisesNav.to"
                  role="menuitem"
                  class="px-md py-sm text-on-surface-dim hover:bg-on-surface/8 hover:text-on-surface block font-medium transition-colors"
                  active-class="!bg-on-surface/10 !text-on-surface"
                  @click="closeAppsMenu"
                >
                  {{ mindExercisesNav.label }}
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </nav>

        <div class="gap-sm lg:gap-md relative z-10 hidden shrink-0 items-center md:flex">
          <AppNavActions variant="desktop" />
        </div>

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

    <Transition name="slide-down">
      <div
        v-if="isMobileMenuOpen"
        class="border-on-surface/10 bg-surface/95 border-t backdrop-blur-xl md:hidden"
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
            :class="navLinkClassMobile"
            @click="closeMenu"
          >
            {{ item.label }}
          </a>
          <p class="text-body-x-sm px-md text-on-surface-dim/70 mt-sm font-semibold uppercase tracking-wider">
            {{ t('landing.nav.appsSection') }}
          </p>
          <NuxtLink
            :to="machineLearningNav.to"
            :class="navLinkClassMobile"
            active-class="bg-white/[0.08] text-white"
            @click="closeMenu"
          >
            {{ machineLearningNav.label }}
          </NuxtLink>
          <NuxtLink
            :to="remoteVehiclesNav.to"
            :class="navLinkClassMobile"
            active-class="bg-white/[0.08] text-white"
            :aria-label="remoteVehiclesNav.label"
            @click="closeMenu"
          >
            {{ remoteVehiclesNav.label }}
          </NuxtLink>
          <NuxtLink
            :to="mindExercisesNav.to"
            :class="navLinkClassMobile"
            active-class="bg-white/[0.08] text-white"
            :aria-label="mindExercisesNav.label"
            @click="closeMenu"
          >
            {{ mindExercisesNav.label }}
          </NuxtLink>

          <div class="mt-md gap-sm pt-md flex flex-col border-t border-white/[0.06]">
            <AppNavActions variant="mobile" />
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

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.15s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
}
</style>
