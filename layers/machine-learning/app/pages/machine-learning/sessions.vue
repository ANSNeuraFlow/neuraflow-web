<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useEegSessions } from '#layers/eeg-sessions/app/composables/useEegSessions';
import type { EegSession } from '#layers/eeg-sessions/app/models/eeg-session.domain';

definePageMeta({
  layout: 'machine-learning',
  title: 'machineLearning.sessions.pageTitle',
});

const { sessions, isLoading, error, fetchSessions } = useEegSessions();

const isCreateOpen = ref(false);
const isDeleteOpen = ref(false);
const isStopOpen = ref(false);
const selectedSession = ref<EegSession | null>(null);

const openStop = (session: EegSession) => {
  selectedSession.value = session;
  isStopOpen.value = true;
};

const openDelete = (session: EegSession) => {
  selectedSession.value = session;
  isDeleteOpen.value = true;
};
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-info/5 pointer-events-none absolute -right-20 -top-20 h-[200px] w-[200px] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div class="gap-sm relative z-10 flex flex-wrap items-center justify-between">
        <div>
          <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
            {{ $t('eegSessions.kicker') }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ $t('eegSessions.title') }}
          </h1>
          <p class="text-body-md mt-xx-sm text-on-surface-dim">
            {{ $t('eegSessions.subtitle', { count: sessions.length }) }}
          </p>
        </div>
        <button
          class="gap-x-sm px-x-lg py-sm text-body-sm duration-short bg-on-surface text-surface hover:bg-on-surface/90 inline-flex items-center rounded-lg focus-visible:outline-none"
          @click="isCreateOpen = true"
        >
          <Icon
            name="material-symbols:add"
            size="1.6rem"
          />
          {{ $t('eegSessions.actions.create') }}
        </button>
      </div>
    </section>

    <div class="mb-x-lg flex items-center justify-between">
      <div>
        <h2 class="text-heading-md text-on-surface font-semibold">
          {{ $t('eegSessions.tableTitle') }}
        </h2>
        <p class="text-body-sm mt-xx-sm text-on-surface-dim">
          {{ $t('eegSessions.tableSubtitle') }}
        </p>
      </div>
      <AppButton
        variant="ghost"
        size="sm"
        :title="$t('eegSessions.actions.refresh')"
        :disabled="isLoading"
        @click="fetchSessions"
      >
        <Icon
          name="material-symbols:refresh"
          size="1.8rem"
          :class="{ 'animate-spin': isLoading }"
        />
      </AppButton>
    </div>

    <div
      v-if="error"
      class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-lg border"
      role="alert"
    >
      {{ error }}
      <AppButton
        variant="ghost"
        size="sm"
        class="ml-sm"
        @click="fetchSessions"
      >
        {{ $t('eegSessions.actions.retry') }}
      </AppButton>
    </div>

    <div class="glass-card overflow-hidden">
      <EegSessionsTable
        :sessions="sessions"
        :is-loading="isLoading"
        @stop-session="openStop"
        @delete-session="openDelete"
      />
    </div>

    <CreateSessionModal
      v-model:open="isCreateOpen"
      @created="fetchSessions"
    />

    <StopSessionModal
      v-model:open="isStopOpen"
      :session="selectedSession"
      @stopped="fetchSessions"
    />

    <DeleteSessionModal
      v-model:open="isDeleteOpen"
      :session="selectedSession"
      @deleted="fetchSessions"
    />
  </div>
</template>
