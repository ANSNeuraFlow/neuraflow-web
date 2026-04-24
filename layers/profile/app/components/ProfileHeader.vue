<script setup lang="ts">
import type { UserProfile } from '../models/profile.domain';

defineProps<{
  profile: UserProfile;
  fullName: string;
  memberSince: string;
  lastLogin: string | null;
}>();
</script>

<template>
  <section class="glass-card mb-x-lg p-md sm:p-x-lg relative overflow-hidden">
    <div
      class="bg-accent/5 pointer-events-none absolute -right-24 -top-24 h-[240px] w-[240px] rounded-full blur-3xl"
      aria-hidden="true"
    />
    <div class="gap-x-lg relative z-10 flex flex-wrap items-center">
      <div
        class="from-accent/20 to-accent/5 border-accent/20 flex h-[7.2rem] w-[7.2rem] shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br"
      >
        <span class="text-accent text-heading-lg font-display font-bold">
          {{ fullName.charAt(0).toUpperCase() }}
        </span>
      </div>

      <div class="flex-1">
        <div class="gap-sm mb-xx-sm flex flex-wrap items-center">
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ fullName }}
          </h1>
          <AppStatusBadge
            v-if="profile.isVerified"
            color="success"
            icon="material-symbols:verified"
            :label="$t('profile.header.verified')"
          />
          <AppStatusBadge
            v-else
            color="warning"
            icon="material-symbols:pending"
            :label="$t('profile.header.unverified')"
          />
        </div>

        <p class="text-body-sm mb-sm text-on-surface-dim">
          {{ profile.email }}
        </p>

        <div class="gap-md flex flex-wrap items-center">
          <AppStatusBadge
            v-if="profile.role"
            color="info"
            icon="material-symbols:badge"
            :label="profile.role.name"
          />
          <span class="text-body-x-sm text-on-surface-dim flex items-center gap-1">
            <Icon
              name="material-symbols:calendar-month"
              size="1.4rem"
              class="text-on-surface-dim"
            />
            {{ $t('profile.header.memberSince', { date: memberSince }) }}
          </span>
          <span
            v-if="lastLogin"
            class="text-body-x-sm text-on-surface-dim flex items-center gap-1"
          >
            <Icon
              name="material-symbols:login"
              size="1.4rem"
            />
            {{ $t('profile.header.lastLogin', { date: lastLogin }) }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
