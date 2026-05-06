<script setup lang="ts">
const head = useLocaleHead();
const route = useRoute();
const { t, te } = useI18n();
const localePath = useLocalePath() as unknown as (path: string) => string;
const isMobileSidebarOpen = ref(false);
const isDark = ref(true);

const title = computed(() => {
  if (route.meta.title && te(route.meta.title as string)) {
    return t(route.meta.title as string);
  }
  return t('mindExercises.meta.defaultTitle');
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

type MindExerciseNavItem = {
  path:
    | '/mind-exercises'
    | '/mind-exercises/slide-block'
    | '/mind-exercises/neuro-balance'
    | '/mind-exercises/forward-gate';
  label: string;
  icon: string;
};

const mindExerciseNavItems = computed<MindExerciseNavItem[]>(() => [
  {
    path: '/mind-exercises',
    label: t('mindExercises.navigation.hub'),
    icon: 'lucide:layout-grid',
  },
  {
    path: '/mind-exercises/slide-block',
    label: t('mindExercises.navigation.blockSlide'),
    icon: 'lucide:move-horizontal',
  },
  {
    path: '/mind-exercises/neuro-balance',
    label: t('mindExercises.navigation.neuroBalance'),
    icon: 'lucide:brain-circuit',
  },
  {
    path: '/mind-exercises/forward-gate',
    label: t('mindExercises.navigation.forwardGate'),
    icon: 'lucide:milestone',
  },
]);

const normalizedPath = computed(() => route.path.replace(/\/$/, '') || '/');

const isNavActive = (item: MindExerciseNavItem): boolean => {
  const target = item.path.replace(/\/$/, '') || '/';
  return normalizedPath.value === target;
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
    localStorage.setItem('neuraflow-mind-exercises-theme', isDark.value ? 'dark' : 'light');
  }
};

onMounted(() => {
  document.body.classList.add('overflow-hidden');

  const saved = localStorage.getItem('neuraflow-mind-exercises-theme');
  if (saved === 'light') {
    isDark.value = false;
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    isDark.value = true;
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});

onBeforeUnmount(() => {
  document.body.classList.remove('overflow-hidden');
});
</script>

<template>
  <div class="bg-surface text-on-surface relative h-dvh max-h-dvh min-h-0 overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-hero-pattern"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 bg-neural-glow"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <svg
        class="absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="mind-exercises-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#6366f1"
              stroke-width="1"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#mind-exercises-grid)"
        />
      </svg>
    </div>
    <div
      class="noise-overlay"
      aria-hidden="true"
    />

    <Transition name="fade-overlay">
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        aria-hidden="true"
        @click="isMobileSidebarOpen = false"
      />
    </Transition>

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
            :aria-label="t('mindExercises.navigation.closeMenu')"
            @click="isMobileSidebarOpen = false"
          >
            <Icon
              name="material-symbols:close"
              size="2.4rem"
            />
          </button>
        </div>

        <div class="px-md py-x-lg flex flex-1 flex-col overflow-y-auto">
          <p class="text-body-x-sm mb-x-sm px-sm text-on-surface-dim font-semibold uppercase tracking-wider">
            {{ t('mindExercises.navigation.section') }}
          </p>
          <nav class="gap-xx-sm flex flex-col">
            <NuxtLink
              v-for="item in mindExerciseNavItems"
              :key="item.path"
              :to="localePath(item.path)"
              class="gap-sm px-sm py-sm text-body-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface flex items-center rounded-lg font-medium transition-colors"
              :class="isNavActive(item) ? 'bg-on-surface/[0.15] text-on-surface' : ''"
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

    <div class="relative z-10 flex h-full min-h-0 flex-col">
      <header
        class="border-on-surface/[0.08] bg-surface/80 px-x-lg sm:px-xx-lg flex h-[6.8rem] shrink-0 items-center justify-between border-b backdrop-blur-xl"
      >
        <div class="gap-md flex items-center">
          <button
            class="p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/10 hover:text-on-surface rounded-lg transition-colors md:hidden"
            :aria-label="t('mindExercises.navigation.openMenu')"
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
            :aria-label="isDark ? t('mindExercises.theme.switchToLight') : t('mindExercises.theme.switchToDark')"
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

      <div class="flex min-h-0 flex-1 overflow-hidden">
        <aside
          class="border-on-surface/[0.08] bg-surface/70 hidden min-h-0 w-[22rem] shrink-0 flex-col overflow-hidden border-r backdrop-blur-xl md:flex"
          role="navigation"
          :aria-label="t('mindExercises.navigation.section')"
        >
          <div class="px-md py-x-lg flex flex-1 flex-col">
            <p class="text-body-x-sm mb-x-sm px-sm text-on-surface-dim font-semibold uppercase tracking-wider">
              {{ t('mindExercises.navigation.section') }}
            </p>
            <nav class="gap-xx-sm flex flex-col">
              <NuxtLink
                v-for="item in mindExerciseNavItems"
                :key="item.path"
                :to="localePath(item.path)"
                class="gap-sm px-sm py-sm text-body-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface flex items-center rounded-lg font-medium transition-colors"
                :class="isNavActive(item) ? 'bg-on-surface/[0.12] text-on-surface font-semibold' : ''"
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
        </aside>

        <main
          class="px-x-lg sm:px-xx-lg pb-xx-lg pt-x-lg min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
        >
          <div class="mx-auto min-h-0 w-full max-w-[132rem]">
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
