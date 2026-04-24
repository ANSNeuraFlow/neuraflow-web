<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useProfile } from '../composables/useProfile';

definePageMeta({
  layout: 'admin',
});

const { t } = useI18n();

const { profile, isLoading, error, fullName, memberSince, lastLoginFormatted, fetchProfile } = useProfile();

useHead({ title: t('profile.pageTitle') });
</script>

<template>
  <div class="mx-auto w-full max-w-[80rem]">
    <div
      v-if="isLoading"
      class="py-xxx-lg flex flex-col items-center justify-center"
      role="status"
    >
      <Icon
        name="material-symbols:progress-activity"
        size="4rem"
        class="text-accent animate-spin"
        aria-hidden="true"
      />
      <p class="text-body-sm mt-md text-on-surface-dim">
        {{ $t('profile.loading') }}
      </p>
    </div>

    <div
      v-else-if="error"
      class="border-error/30 bg-error/10 p-x-lg text-body-sm text-error flex items-center justify-between rounded-xl border"
      role="alert"
    >
      <span>{{ error }}</span>
      <AppButton
        variant="ghost"
        size="sm"
        @click="fetchProfile"
      >
        {{ $t('profile.retry') }}
      </AppButton>
    </div>

    <template v-else-if="profile">
      <ProfileHeader
        :profile="profile"
        :full-name="fullName"
        :member-since="memberSince"
        :last-login="lastLoginFormatted"
      />

      <ProfileStats :stats="profile.stats" />

      <ProfileEditForm
        :profile="profile"
        @updated="(updated) => (profile = updated)"
      />
    </template>
  </div>
</template>
