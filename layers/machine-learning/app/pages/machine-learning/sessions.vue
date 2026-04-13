<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useEegSessions } from '#layers/eeg-sessions/app/composables/useEegSessions';
import type { EegSession } from '#layers/eeg-sessions/app/models/eeg-session.domain';

definePageMeta({
  layout: 'machine-learning',
  title: 'machineLearning.sessions.pageTitle',
});

const { sessions, isLoading, fetchSessions } = useEegSessions();
const isCreateOpen = ref(false);
const isStopOpen = ref(false);
const selectedSession = ref<EegSession | null>(null);

const activeSession = computed<EegSession | undefined>(() =>
  sessions.value.find((s) => s.status === 'INITIALIZED' || s.status === 'ACTIVE'),
);

const openStop = () => {
  if (!activeSession.value) return;
  selectedSession.value = activeSession.value;
  isStopOpen.value = true;
};
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-info/5 pointer-events-none absolute -right-20 -top-20 h-[200px] w-[200px] rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div
        v-if="isLoading"
        class="py-xx-lg relative z-10 flex items-center justify-center"
      >
        <Icon
          name="material-symbols:progress-activity"
          size="2.4rem"
          class="text-accent animate-spin"
        />
      </div>

      <div
        v-else-if="!activeSession"
        class="gap-sm relative z-10 flex flex-wrap items-center justify-between"
      >
        <div>
          <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
            {{ $t('machineLearning.sessions.kicker') }}
          </p>
          <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
            {{ $t('machineLearning.sessions.title') }}
          </h1>
          <p class="text-body-md mt-xx-sm text-on-surface-dim">
            {{ $t('machineLearning.sessions.noActiveSession') }}
          </p>
        </div>
        <AppButton @click="isCreateOpen = true">
          <Icon
            name="material-symbols:add"
            size="1.6rem"
          />
          {{ $t('eegSessions.actions.create') }}
        </AppButton>
      </div>

      <div
        v-else
        class="gap-sm relative z-10 flex flex-wrap items-center justify-between"
      >
        <div class="gap-md flex items-center">
          <div class="relative flex h-[1.2rem] w-[1.2rem] shrink-0">
            <span class="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span class="bg-success relative inline-flex h-[1.2rem] w-[1.2rem] rounded-full" />
          </div>
          <div>
            <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
              {{ $t('machineLearning.sessions.activeSession') }}
            </p>
            <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
              {{ activeSession.sessionName }}
            </h1>
            <p class="text-body-md mt-xx-sm text-on-surface-dim">
              {{ activeSession.protocolName }}
              · {{ $t(`eegSessions.status.${activeSession.status}`) }}
            </p>
          </div>
        </div>
        <AppButton
          variant="destructive"
          @click="openStop"
        >
          <Icon
            name="material-symbols:stop-circle-outline"
            size="1.6rem"
          />
          {{ $t('machineLearning.sessions.endSession') }}
        </AppButton>
      </div>
    </section>

    <CreateSessionModal
      v-model:open="isCreateOpen"
      @created="fetchSessions"
    />
    <StopSessionModal
      v-model:open="isStopOpen"
      :session="selectedSession"
      @stopped="fetchSessions"
    />
  </div>
</template>
