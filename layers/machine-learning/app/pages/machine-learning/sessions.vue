<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useEegSessions } from '#layers/eeg-sessions/app/composables/useEegSessions';
import type { EegSession } from '#layers/eeg-sessions/app/models/eeg-session.domain';

definePageMeta({
  layout: 'machine-learning',
  title: 'machineLearning.sessions.pageTitle',
});

const { sessions, isLoading, error, fetchSessions } = useEegSessions();
const isStopOpen = ref(false);
const isDeleteOpen = ref(false);
const selectedSession = ref<EegSession | null>(null);

const activeSession = computed<EegSession | undefined>(() =>
  sessions.value.find((s) => s.status === 'INITIALIZED' || s.status === 'ACTIVE'),
);

const openStop = (session: EegSession) => {
  selectedSession.value = session;
  isStopOpen.value = true;
};

const openDelete = (session: EegSession) => {
  selectedSession.value = session;
  isDeleteOpen.value = true;
};

const openActiveStop = () => {
  if (!activeSession.value) return;
  selectedSession.value = activeSession.value;
  isStopOpen.value = true;
};

const onCalibrationFinished = async () => {
  await fetchSessions();
};

const onCalibrationAborted = async () => {
  await fetchSessions();
};
</script>

<template>
  <div class="gap-x-lg mx-auto flex w-full max-w-[120rem] flex-col">
    <section class="glass-card p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-info/5 pointer-events-none absolute -right-20 -top-20 h-[200px] w-[200px] rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div
        v-if="isLoading && sessions.length === 0"
        class="py-x-lg relative z-10 flex items-center justify-center"
      >
        <Icon
          name="material-symbols:progress-activity"
          size="2.4rem"
          class="text-accent animate-spin"
        />
      </div>

      <div
        v-else-if="!activeSession"
        class="relative z-10"
      >
        <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
          {{ $t('machineLearning.sessions.kicker') }}
        </p>
        <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
          {{ $t('machineLearning.sessions.title') }}
        </h1>
        <p class="text-body-md mt-xx-sm text-on-surface-dim">
          {{ $t('machineLearning.sessions.subtitle') }}
        </p>
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
          @click="openActiveStop"
        >
          <Icon
            name="material-symbols:stop-circle-outline"
            size="1.6rem"
          />
          {{ $t('machineLearning.sessions.endSession') }}
        </AppButton>
      </div>
    </section>

    <section class="glass-card relative overflow-hidden">
      <div
        class="bg-accent/5 pointer-events-none absolute -left-20 -top-20 h-[250px] w-[250px] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div class="border-on-surface/[0.06] p-md sm:p-x-lg relative z-10 border-b">
        <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
          {{ $t('machineLearning.sessions.kicker') }}
        </p>
        <div class="gap-md flex flex-wrap items-start justify-between">
          <div>
            <h2 class="text-heading-md tracking-sm text-on-surface font-display font-bold">
              {{ $t('machineLearning.sessions.calibrationTitle') }}
            </h2>
            <p class="text-body-sm mt-xx-sm text-on-surface-dim">
              {{ $t('machineLearning.sessions.calibrationSubtitle') }}
            </p>
          </div>
        </div>
      </div>
      <div class="p-md sm:p-x-lg relative z-10">
        <BciCalibrationUI
          @finished="onCalibrationFinished"
          @aborted="onCalibrationAborted"
        />
      </div>
    </section>

    <section>
      <div class="mb-sm gap-sm flex flex-wrap items-center justify-between">
        <div>
          <h2 class="text-heading-md text-on-surface font-semibold">
            {{ $t('machineLearning.sessions.historyTitle') }}
          </h2>
          <p class="text-body-sm mt-xx-sm text-on-surface-dim">
            {{ $t('machineLearning.sessions.historySubtitle', { count: sessions.length }) }}
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
        class="mb-sm border-error/30 bg-error/10 p-md text-body-sm text-error rounded-lg border"
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
    </section>

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
