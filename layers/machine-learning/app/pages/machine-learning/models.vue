<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useEegSessions } from '#layers/eeg-sessions/app/composables/useEegSessions';
import type { EegSession } from '#layers/eeg-sessions/app/models/eeg-session.domain';
import { useMlModels } from '#layers/ml-models/app/composables/useMlModels';
import type { MlModel } from '#layers/ml-models/app/models/ml-model.domain';
import { useTrainingJobs } from '#layers/training-jobs/app/composables/useTrainingJobs';
import type { TrainingJob } from '#layers/training-jobs/app/models/training-job.domain';
import { useTrainingJobService } from '#layers/training-jobs/app/services/training-job.service';

definePageMeta({
  layout: 'machine-learning',
  title: 'machineLearning.models.pageTitle',
});

const { t } = useI18n();
const { sessions, isLoading: sessionsLoading, error: sessionsError, fetchSessions } = useEegSessions();
const { jobs, isLoading: jobsLoading, error: jobsError, fetchJobs } = useTrainingJobs();
const { models, isLoading: modelsLoading, error: modelsError, fetchModels } = useMlModels();
const trainingJobService = useTrainingJobService();

const isDeleteOpen = ref(false);
const isStopOpen = ref(false);
const selectedSession = ref<EegSession | null>(null);

const isDeleteModelOpen = ref(false);
const selectedMlModel = ref<MlModel | null>(null);

const isJobDetailsOpen = ref(false);
const selectedJob = ref<TrainingJob | null>(null);

const isModelDetailsOpen = ref(false);
const selectedModelDetails = ref<MlModel | null>(null);

const isPickingSessions = ref(false);
const selectedSessionIds = ref<string[]>([]);
const isDispatching = ref(false);
const dispatchError = ref<string | null>(null);

watch(
  sessions,
  (list) => {
    const completed = new Set(list.filter((s) => s.status === 'COMPLETED').map((s) => s.id));
    selectedSessionIds.value = selectedSessionIds.value.filter((id) => completed.has(id));
  },
  { deep: true },
);

const clearSelection = () => {
  selectedSessionIds.value = [];
  dispatchError.value = null;
};

const cancelTrainingSetup = () => {
  isPickingSessions.value = false;
  clearSelection();
};

const runTraining = async () => {
  if (selectedSessionIds.value.length === 0) return;

  isDispatching.value = true;
  dispatchError.value = null;

  try {
    await trainingJobService.dispatchTrainingJob({ sessionIds: selectedSessionIds.value });
    cancelTrainingSetup();
    await fetchJobs();
    await fetchModels();
  } catch (err: unknown) {
    const e = err as { data?: { message?: string } };
    dispatchError.value = e?.data?.message ?? t('trainingJobs.errors.dispatchFailed');
  } finally {
    isDispatching.value = false;
  }
};

const openStop = (session: EegSession) => {
  selectedSession.value = session;
  isStopOpen.value = true;
};

const openDelete = (session: EegSession) => {
  selectedSession.value = session;
  isDeleteOpen.value = true;
};

const openDeleteModel = (model: MlModel) => {
  selectedMlModel.value = model;
  isDeleteModelOpen.value = true;
};

const openJobDetails = (job: TrainingJob) => {
  selectedJob.value = job;
  isJobDetailsOpen.value = true;
};

const openModelDetails = (model: MlModel) => {
  selectedModelDetails.value = model;
  isModelDetailsOpen.value = true;
};
</script>

<template>
  <div class="mx-auto w-full max-w-[120rem]">
    <section class="glass-card mb-x-lg p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-accent/5 pointer-events-none absolute -right-20 -top-20 h-[200px] w-[200px] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div class="relative z-10">
        <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
          {{ $t('machineLearning.models.kicker') }}
        </p>
        <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
          {{ $t('machineLearning.models.title') }}
        </h1>
        <p class="text-body-md mt-xx-sm text-on-surface-dim">
          {{ $t('machineLearning.models.subtitle') }}
        </p>
      </div>
    </section>

    <div class="mb-x-lg gap-md flex flex-wrap items-center justify-between">
      <div>
        <h2 class="text-heading-md text-on-surface font-semibold">
          {{ $t('machineLearning.models.dataForModelTitle') }}
        </h2>
        <p class="text-body-sm mt-xx-sm text-on-surface-dim">
          {{
            isPickingSessions
              ? $t('machineLearning.models.dataForModelSubtitlePicking')
              : $t('machineLearning.models.dataForModelSubtitle')
          }}
        </p>
      </div>
      <div class="gap-sm flex flex-wrap items-center">
        <AppButton
          variant="ghost"
          size="sm"
          :title="$t('eegSessions.actions.refresh')"
          :disabled="sessionsLoading"
          @click="fetchSessions"
        >
          <Icon
            name="material-symbols:refresh"
            size="1.8rem"
            :class="{ 'animate-spin': sessionsLoading }"
          />
        </AppButton>
        <template v-if="!isPickingSessions">
          <AppButton
            size="sm"
            @click="isPickingSessions = true"
          >
            <Icon
              name="material-symbols:neurology"
              size="1.6rem"
            />
            {{ $t('machineLearning.models.newModel') }}
          </AppButton>
        </template>
        <template v-else>
          <AppButton
            variant="ghost"
            size="sm"
            :disabled="isDispatching"
            @click="cancelTrainingSetup"
          >
            {{ $t('trainingJobs.actions.cancel') }}
          </AppButton>
          <AppButton
            size="sm"
            :loading="isDispatching"
            :disabled="selectedSessionIds.length === 0"
            @click="runTraining"
          >
            <Icon
              name="material-symbols:model-training"
              size="1.6rem"
            />
            {{ $t('machineLearning.models.trainModel') }}
          </AppButton>
        </template>
      </div>
    </div>

    <div
      v-if="sessionsError"
      class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-lg border"
      role="alert"
    >
      {{ sessionsError }}
      <AppButton
        variant="ghost"
        size="sm"
        class="ml-sm"
        @click="fetchSessions"
      >
        {{ $t('eegSessions.actions.retry') }}
      </AppButton>
    </div>

    <div
      v-if="isPickingSessions && dispatchError"
      class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-lg border"
      role="alert"
    >
      {{ dispatchError }}
    </div>

    <div class="glass-card mb-x-lg overflow-hidden">
      <EegSessionsTable
        v-model:selected-ids="selectedSessionIds"
        :sessions="sessions"
        :is-loading="sessionsLoading"
        :selectable="isPickingSessions"
        @stop-session="openStop"
        @delete-session="openDelete"
      />
    </div>

    <div class="mb-x-lg flex items-center justify-between">
      <div>
        <h2 class="text-heading-md text-on-surface font-semibold">
          {{ $t('trainingJobs.title') }}
        </h2>
        <p class="text-body-sm mt-xx-sm text-on-surface-dim">
          {{ $t('trainingJobs.subtitle', { count: jobs.length }) }}
        </p>
      </div>
      <AppButton
        variant="ghost"
        size="sm"
        :title="$t('trainingJobs.actions.refresh')"
        :disabled="jobsLoading"
        @click="fetchJobs"
      >
        <Icon
          name="material-symbols:refresh"
          size="1.8rem"
          :class="{ 'animate-spin': jobsLoading }"
        />
      </AppButton>
    </div>

    <div
      v-if="jobsError"
      class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-lg border"
      role="alert"
    >
      {{ jobsError }}
      <AppButton
        variant="ghost"
        size="sm"
        class="ml-sm"
        @click="fetchJobs"
      >
        {{ $t('eegSessions.actions.retry') }}
      </AppButton>
    </div>

    <div class="glass-card mb-x-lg overflow-hidden">
      <TrainingJobsTable
        :jobs="jobs"
        :is-loading="jobsLoading"
        @view-details="openJobDetails"
      />
    </div>

    <div class="mb-x-lg flex items-center justify-between">
      <div>
        <h2 class="text-heading-md text-on-surface font-semibold">
          {{ $t('mlModels.title') }}
        </h2>
        <p class="text-body-sm mt-xx-sm text-on-surface-dim">
          {{ $t('mlModels.subtitle', { count: models.length }) }}
        </p>
      </div>
      <AppButton
        variant="ghost"
        size="sm"
        :title="$t('mlModels.actions.refresh')"
        :disabled="modelsLoading"
        @click="fetchModels"
      >
        <Icon
          name="material-symbols:refresh"
          size="1.8rem"
          :class="{ 'animate-spin': modelsLoading }"
        />
      </AppButton>
    </div>

    <div
      v-if="modelsError"
      class="mb-x-lg border-error/30 bg-error/10 p-md text-body-sm text-error rounded-lg border"
      role="alert"
    >
      {{ modelsError }}
      <AppButton
        variant="ghost"
        size="sm"
        class="ml-sm"
        @click="fetchModels"
      >
        {{ $t('eegSessions.actions.retry') }}
      </AppButton>
    </div>

    <div class="glass-card mb-x-lg overflow-hidden">
      <MlModelsTable
        :models="models"
        :is-loading="modelsLoading"
        @delete-model="openDeleteModel"
        @view-details="openModelDetails"
      />
    </div>

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
    <DeleteMlModelModal
      v-model:open="isDeleteModelOpen"
      :model="selectedMlModel"
      @deleted="fetchModels"
    />
    <TrainingJobDetailsModal
      v-model:open="isJobDetailsOpen"
      :job="selectedJob"
    />
    <MlModelDetailsModal
      v-model:open="isModelDetailsOpen"
      :model="selectedModelDetails"
    />
  </div>
</template>
