<script setup lang="ts">
import { useEegSessions } from '#layers/eeg-sessions/app/composables/useEegSessions';
import type { EegSession } from '#layers/eeg-sessions/app/models/eeg-session.domain';

definePageMeta({
  layout: 'machine-learning',
  title: 'machineLearning.sessions.motorImageryPageTitle',
});

const localePath = useLocalePath();
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

const protocolSteps = [
  { key: '1', labelKey: 'protocolStep1Label', descKey: 'protocolStep1Desc', icon: 'material-symbols:sensors' },
  { key: '2', labelKey: 'protocolStep2Label', descKey: 'protocolStep2Desc', icon: 'material-symbols:tune' },
  { key: '3', labelKey: 'protocolStep3Label', descKey: 'protocolStep3Desc', icon: 'material-symbols:fullscreen' },
  {
    key: '4',
    labelKey: 'protocolStep4Label',
    descKey: 'protocolStep4Desc',
    icon: 'material-symbols:check-circle-outline',
  },
] as const;
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <div class="mb-md">
      <NuxtLink
        :to="localePath('/machine-learning/sessions')"
        class="text-body-sm text-on-surface-dim hover:text-on-surface duration-short gap-xx-sm inline-flex items-center transition-colors"
      >
        <Icon
          name="material-symbols:arrow-back"
          size="1.6rem"
        />
        {{ $t('machineLearning.sessions.motorImageryBackToChoice') }}
      </NuxtLink>
    </div>

    <section class="glass-card p-md sm:p-x-lg mb-x-lg relative overflow-hidden">
      <div
        class="bg-info/5 pointer-events-none absolute -right-20 -top-20 h-[240px] w-[240px] rounded-full blur-3xl"
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
          {{ $t('machineLearning.sessions.motorImageryPageKicker') }}
        </p>
        <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
          {{ $t('machineLearning.sessions.motorImageryPageTitle') }}
        </h1>
        <p class="text-body-md mt-xx-sm text-on-surface-dim">
          {{ $t('machineLearning.sessions.motorImageryPageSubtitle') }}
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

    <div class="gap-x-lg mb-x-lg grid grid-cols-1 lg:grid-cols-3">
      <div class="glass-card relative flex flex-col overflow-hidden lg:col-span-2">
        <div
          class="bg-info/[0.04] pointer-events-none absolute -right-12 -top-12 h-[180px] w-[180px] rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div class="border-on-surface/[0.06] px-md py-sm sm:px-x-lg relative z-10 border-b">
          <p class="text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">
            {{ $t('machineLearning.sessions.motorImageryNewSessionTitle') }}
          </p>
        </div>
        <div class="p-md sm:p-x-lg relative z-10 flex flex-1 flex-col">
          <BciCalibrationUI
            @finished="onCalibrationFinished"
            @aborted="onCalibrationAborted"
          />
        </div>
      </div>

      <div class="glass-card relative flex flex-col overflow-hidden">
        <div
          class="bg-accent/[0.04] pointer-events-none absolute -left-12 -top-12 h-[180px] w-[180px] rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div class="border-on-surface/[0.06] px-md py-sm sm:px-x-lg relative z-10 border-b">
          <p class="text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">
            {{ $t('machineLearning.sessions.protocolTitle') }}
          </p>
        </div>
        <div class="p-md sm:p-x-lg relative z-10 flex flex-1 flex-col">
          <ol class="gap-x-lg relative flex flex-col">
            <div
              class="bg-on-surface/[0.06] absolute left-[1.5rem] top-[3.2rem] hidden h-[calc(100%-5.6rem)] w-px lg:block"
              aria-hidden="true"
            />
            <li
              v-for="step in protocolSteps"
              :key="step.key"
              class="gap-md relative flex items-start"
            >
              <div
                class="bg-on-surface/[0.06] border-on-surface/[0.10] relative z-10 flex h-[3rem] w-[3rem] shrink-0 items-center justify-center rounded-full border"
              >
                <Icon
                  :name="step.icon"
                  size="1.4rem"
                  class="text-on-surface-dim"
                />
              </div>
              <div class="pb-x-lg min-w-0 flex-1 last:pb-0">
                <p class="text-body-sm text-on-surface font-semibold leading-snug">
                  {{ $t(`machineLearning.sessions.${step.labelKey}`) }}
                </p>
                <p class="text-body-sm mt-xx-sm text-on-surface-dim leading-relaxed">
                  {{ $t(`machineLearning.sessions.${step.descKey}`) }}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>

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
