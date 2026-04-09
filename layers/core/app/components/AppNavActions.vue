<script setup lang="ts">
import { PERMISSIONS } from '#layers/auth/app/models/user.domain';
import { useAuthService } from '#layers/auth/app/services/auth.service';
import { useUserSessionStore } from '#layers/auth/app/store/user-session.store';

defineProps<{
  variant: 'desktop' | 'mobile';
}>();

const { t } = useI18n();
const localePath = useLocalePath();
const sessionStore = useUserSessionStore();
const authService = useAuthService();

const canAccessAdmin = computed(() => sessionStore.user?.permissions?.includes(PERMISSIONS.VIEW_ADMIN_PANEL) ?? false);

const handleLogout = async () => {
  try {
    await authService.logout();
  } catch {
    //
  } finally {
    sessionStore.logout();
    await navigateTo(localePath('/'));
  }
};
</script>

<template>
  <template v-if="!sessionStore.isAuthenticated">
    <template v-if="variant === 'desktop'">
      <button
        class="px-md py-xx-sm text-body-x-sm duration-short border-on-surface/10 bg-on-surface/[0.04] text-on-surface hover:border-on-surface/20 hover:bg-on-surface/[0.07] inline-flex items-center rounded-lg border font-semibold backdrop-blur-sm transition-colors focus-visible:outline-none"
        :aria-label="t('landing.nav.login')"
        @click="navigateTo(localePath('/login'))"
      >
        {{ t('landing.nav.login') }}
      </button>
      <button
        class="px-md py-xx-sm text-body-x-sm duration-short bg-on-surface text-surface hover:bg-on-surface/90 inline-flex items-center rounded-lg font-semibold transition-colors hover:scale-[1.02] focus-visible:outline-none active:scale-[0.98]"
        :aria-label="t('landing.nav.register')"
        @click="navigateTo(localePath('/register'))"
      >
        {{ t('landing.nav.register') }}
      </button>
    </template>

    <template v-if="variant === 'mobile'">
      <button
        class="btn-secondary w-full justify-center"
        @click="navigateTo(localePath('/login'))"
      >
        {{ t('landing.nav.login') }}
      </button>
      <button
        class="btn-primary w-full justify-center"
        @click="navigateTo(localePath('/register'))"
      >
        {{ t('landing.nav.register') }}
      </button>
    </template>
  </template>

  <template v-else>
    <template v-if="variant === 'desktop'">
      <NuxtLink
        v-if="canAccessAdmin"
        :to="localePath('/admin/users')"
        class="px-md py-xx-sm text-body-x-sm duration-short border-on-surface/10 bg-on-surface/[0.04] text-on-surface hover:border-on-surface/20 hover:bg-on-surface/[0.07] inline-flex items-center rounded-lg border font-semibold backdrop-blur-sm transition-colors focus-visible:outline-none"
      >
        {{ t('landing.nav.adminPanel') }}
      </NuxtLink>
      <button
        v-else
        class="px-md py-xx-sm text-body-x-sm duration-short border-on-surface/10 bg-on-surface/[0.04] text-on-surface hover:border-on-surface/20 hover:bg-on-surface/[0.07] inline-flex items-center rounded-lg border font-semibold backdrop-blur-sm transition-colors focus-visible:outline-none"
        :aria-label="t('landing.nav.profile')"
        @click="navigateTo(localePath('/'))"
      >
        {{ t('landing.nav.profile') }}
      </button>

      <button
        class="px-md py-xx-sm text-body-x-sm duration-short bg-on-surface text-surface hover:bg-on-surface/90 inline-flex items-center rounded-lg font-semibold transition-colors hover:scale-[1.02] focus-visible:outline-none active:scale-[0.98]"
        :aria-label="t('landing.nav.logout')"
        @click="handleLogout"
      >
        {{ t('landing.nav.logout') }}
      </button>
    </template>

    <template v-if="variant === 'mobile'">
      <NuxtLink
        v-if="canAccessAdmin"
        :to="localePath('/admin/users')"
        class="btn-secondary w-full justify-center"
      >
        {{ t('landing.nav.adminPanel') }}
      </NuxtLink>
      <button
        v-else
        class="btn-secondary w-full justify-center"
        @click="navigateTo(localePath('/'))"
      >
        {{ t('landing.nav.profile') }}
      </button>

      <button
        class="btn-primary w-full justify-center"
        @click="handleLogout"
      >
        {{ t('landing.nav.logout') }}
      </button>
    </template>
  </template>
</template>
