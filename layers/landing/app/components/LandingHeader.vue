<script setup lang="ts">
const { t } = useI18n();
const isMenuOpen = ref(false);

const navItems = computed(() => [
  { id: 'highlights', label: t('landing.nav.highlights') },
  { id: 'capabilities', label: t('landing.nav.capabilities') },
  { id: 'how-it-works', label: t('landing.nav.howItWorks') },
  { id: 'technology', label: t('landing.nav.technology') },
  { id: 'contact', label: t('landing.nav.contact') },
]);

const closeMenu = () => {
  isMenuOpen.value = false;
};
</script>

<template>
  <header class="top-none border-on-surface/8 bg-surface/80 sticky z-50 border-b backdrop-blur-md">
    <div class="gap-md px-md py-md lg:px-xx-lg container mx-auto flex w-full items-center justify-between">
      <a
        href="#top"
        class="duration-short inline-flex items-center transition-opacity ease-out hover:opacity-80"
        :aria-label="t('landing.hero.badge')"
      >
        <BrandLogo size="small" />
      </a>

      <nav
        class="gap-lg hidden items-center md:flex"
        :aria-label="t('landing.nav.openMenu')"
      >
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          class="text-body-sm text-on-surface-dim duration-short hover:text-on-surface font-medium transition-colors ease-out"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="gap-sm hidden items-center md:flex">
        <AppButton
          variant="ghost"
          size="sm"
          @click="navigateTo('/login')"
        >
          {{ t('landing.nav.login') }}
        </AppButton>
        <AppButton
          variant="primary"
          size="sm"
          @click="navigateTo('/register')"
        >
          {{ t('landing.nav.register') }}
        </AppButton>
      </div>

      <button
        class="h-x-huge w-x-huge border-on-surface/10 bg-surface-container text-on-surface duration-short hover:bg-on-surface/5 inline-flex items-center justify-center rounded-sm border transition-colors ease-out md:hidden"
        type="button"
        :aria-label="isMenuOpen ? t('landing.nav.closeMenu') : t('landing.nav.openMenu')"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <Icon
          :name="isMenuOpen ? 'material-symbols:close-rounded' : 'material-symbols:menu-rounded'"
          size="2rem"
          aria-hidden="true"
        />
      </button>
    </div>

    <nav
      v-if="isMenuOpen"
      class="border-on-surface/8 bg-surface-container/95 px-md py-md border-t md:hidden"
      :aria-label="t('landing.nav.openMenu')"
    >
      <div class="gap-sm flex flex-col">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#${item.id}`"
          class="px-sm py-sm text-body-sm text-on-surface-dim duration-short hover:bg-on-surface/5 hover:text-on-surface rounded-sm font-medium transition-colors ease-out"
          @click="closeMenu"
        >
          {{ item.label }}
        </a>
      </div>
      <div class="mt-md gap-sm flex items-center">
        <AppButton
          variant="ghost"
          size="full"
          @click="navigateTo('/login')"
        >
          {{ t('landing.nav.login') }}
        </AppButton>
        <AppButton
          variant="primary"
          size="full"
          @click="navigateTo('/register')"
        >
          {{ t('landing.nav.register') }}
        </AppButton>
      </div>
    </nav>
  </header>
</template>
