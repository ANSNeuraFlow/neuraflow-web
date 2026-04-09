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
  <div class="bg-surface text-on-surface relative min-h-screen">
    <div
      class="pointer-events-none absolute inset-0 bg-hero-pattern"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 bg-neural-glow"
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
        class="border-on-surface/[0.08] bg-surface fixed left-0 top-0 z-40 flex h-full w-[26rem] flex-col border-r shadow-neural-lg backdrop-blur-2xl md:hidden"
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
              active-class="bg-neural-500/[0.15] text-neural-300"
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

      <div class="flex flex-1 overflow-hidden">
        <!-- Desktop sidebar -->
        <aside
          class="border-on-surface/[0.08] bg-surface/50 hidden w-[24rem] shrink-0 flex-col border-r backdrop-blur-xl md:flex"
        >
          <div class="px-x-lg py-x-lg flex flex-1 flex-col overflow-y-auto">
            <p class="mb-sm px-sm text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">
              {{ t('admin.navigation.section') }}
            </p>

            <nav
              class="gap-xx-sm flex flex-col"
              role="navigation"
            >
              <NuxtLink
                v-for="item in adminNavItems"
                :key="item.label"
                :to="item.to"
                class="gap-sm px-sm py-sm text-body-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface flex items-center rounded-lg font-medium transition-colors"
                active-class="bg-neural-500/[0.15] text-neural-300"
              >
                <Icon
                  :name="item.icon"
                  size="1.8rem"
                  class="shrink-0"
                />
                <span>{{ item.label }}</span>
              </NuxtLink>
            </nav>
          </div>

          <div class="border-on-surface/[0.08] px-x-lg py-md border-t">
            <NuxtLink
              :to="localePath('/')"
              class="gap-md px-md py-sm text-body-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface flex w-full items-center rounded-xl font-medium transition-colors"
            >
              <Icon
                name="material-symbols:arrow-back"
                size="1.8rem"
              />
              <span>{{ t('admin.navigation.backToSite') }}</span>
            </NuxtLink>
          </div>
        </aside>

        <!-- Main content -->
        <main class="p-x-lg sm:p-xx-lg flex-1 overflow-y-auto">
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
