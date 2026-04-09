<script setup lang="ts">
const head = useLocaleHead();
const route = useRoute();
const { t, te } = useI18n();
const localePath = useLocalePath();
const isMobileSidebarOpen = ref(false);
const isDark = ref(true);

const title = computed(() => {
  if (route.meta.title && te(route.meta.title as string)) {
    return t(route.meta.title as string);
  }
  return 'NeuraFlow Admin';
});

useHead({
  htmlAttrs: {
    lang: head.value.htmlAttrs?.lang,
    dir: head.value.htmlAttrs?.dir as 'ltr' | 'rtl' | 'auto' | undefined,
    class: 'theme-dark overscroll-none',
  },
  title,
  bodyAttrs: {
    class: 'font-roboto',
  },
});

const adminNavItems = computed(() => [
  {
    to: localePath('/admin/users'),
    label: t('admin.navigation.users'),
    icon: 'material-symbols:group',
  },
  {
    to: localePath('/admin/cluster'),
    label: t('admin.navigation.clusters'),
    icon: 'material-symbols:dns',
  },
]);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
    localStorage.setItem('neuraflow-admin-theme', isDark.value ? 'dark' : 'light');
  }
};

onMounted(() => {
  const saved = localStorage.getItem('neuraflow-admin-theme');
  if (saved === 'light') {
    isDark.value = false;
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    isDark.value = true;
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});
</script>

<template>
  <div class="bg-surface text-on-surface relative min-h-screen overflow-x-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-hero-pattern opacity-50"
      aria-hidden="true"
    />
    <div
      class="bg-info/5 dark:bg-info/10 pointer-events-none absolute left-0 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl"
      aria-hidden="true"
    />
    <div
      class="bg-accent/5 dark:bg-accent/10 pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full blur-3xl"
      aria-hidden="true"
    />
    <div
      class="noise-overlay"
      aria-hidden="true"
    />

    <!-- Mobile overlay -->
    <Transition name="fade-overlay">
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        aria-hidden="true"
        @click="isMobileSidebarOpen = false"
      />
    </Transition>

    <!-- Mobile sidebar drawer -->
    <Transition name="slide-sidebar">
      <aside
        v-if="isMobileSidebarOpen"
        class="border-on-surface/[0.08] bg-surface fixed left-0 top-0 z-40 flex h-full w-[26rem] flex-col border-r shadow-2xl backdrop-blur-2xl md:hidden"
        role="navigation"
      >
        <div class="border-on-surface/[0.08] px-x-lg flex h-16 shrink-0 items-center justify-between border-b">
          <NuxtLink
            :to="localePath('/')"
            class="gap-sm flex items-center"
            @click="isMobileSidebarOpen = false"
          >
            <BrandLogo class="h-8" />
            <span class="text-body-lg tracking-sm text-on-surface font-display font-bold">
              Neura<span class="gradient-text">Flow</span>
            </span>
          </NuxtLink>
          <button
            class="p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/10 hover:text-on-surface rounded-lg transition-colors"
            :aria-label="t('admin.navigation.closeMenu')"
            @click="isMobileSidebarOpen = false"
          >
            <Icon
              name="material-symbols:close"
              size="2.4rem"
            />
          </button>
        </div>

        <div class="px-md py-x-lg flex flex-1 flex-col overflow-y-auto">
          <p class="mb-sm px-sm text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">
            {{ t('admin.navigation.section') }}
          </p>
          <nav class="gap-xx-sm flex flex-col">
            <NuxtLink
              v-for="item in adminNavItems"
              :key="item.label"
              :to="item.to"
              class="gap-sm px-sm py-sm text-body-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface flex items-center rounded-lg font-medium transition-colors"
              active-class="bg-on-surface/[0.15] text-on-surface"
              @click="isMobileSidebarOpen = false"
            >
              <Icon
                :name="item.icon"
                size="1.8rem"
                class="shrink-0"
              />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>

          <div class="border-on-surface/[0.08] pt-x-lg mt-auto border-t">
            <AppNavActions variant="mobile" />
          </div>
        </div>
      </aside>
    </Transition>

    <div class="relative z-10 flex h-screen flex-col">
      <header
        class="border-on-surface/[0.08] bg-surface/80 px-x-lg sm:px-xx-lg flex h-[6.8rem] shrink-0 items-center justify-between border-b backdrop-blur-xl"
      >
        <div class="gap-md flex items-center">
          <button
            class="p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/10 hover:text-on-surface rounded-lg transition-colors md:hidden"
            :aria-label="t('admin.navigation.openMenu')"
            @click="isMobileSidebarOpen = true"
          >
            <Icon
              name="material-symbols:menu"
              size="2.4rem"
            />
          </button>

          <NuxtLink
            :to="localePath('/')"
            class="gap-md px-xx-sm py-xx-sm duration-short hover:bg-on-surface/[0.05] group flex items-center rounded-lg transition-colors"
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
          </NuxtLink>
        </div>

        <div class="gap-sm flex items-center">
          <button
            class="p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/10 hover:text-on-surface rounded-lg transition-colors"
            :aria-label="isDark ? t('admin.theme.switchToLight') : t('admin.theme.switchToDark')"
            @click="toggleTheme"
          >
            <Icon
              :name="isDark ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'"
              size="2rem"
            />
          </button>

          <div class="gap-md hidden items-center md:flex">
            <AppNavActions variant="desktop" />
          </div>
        </div>
      </header>

      <div class="pb-lg px-x-lg relative z-20 flex w-full shrink-0 justify-center pt-7">
        <nav
          class="gap-x-sm lg:gap-md xl:gap-x-lg glass-card px-md py-sm hidden items-center !rounded-full shadow-2xl md:flex"
          role="navigation"
        >
          <NuxtLink
            v-for="item in adminNavItems"
            :key="item.label"
            :to="item.to"
            class="px-md py-sm text-body-sm duration-short text-on-surface-dim hover:bg-on-surface/5 hover:text-on-surface gap-sm flex shrink-0 items-center whitespace-nowrap rounded-full font-medium transition-colors ease-out"
            active-class="bg-on-surface/10 text-on-surface font-semibold"
          >
            <Icon
              :name="item.icon"
              size="1.8rem"
              class="shrink-0"
            />
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <main class="px-x-lg sm:px-xx-lg pb-xx-lg flex-1 overflow-y-auto">
          <div class="mx-auto w-full max-w-[132rem]">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: transform 0.28s cubic-bezier(0.65, 0, 0.35, 1);
}

.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(-100%);
}

.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.25s ease;
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
</style>
