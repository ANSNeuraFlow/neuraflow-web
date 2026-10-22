<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useModelEval } from '../../../composables/useModelEval';

definePageMeta({
  layout: 'machine-learning',
  title: 'machineLearning.modelEval.pageTitle',
});

const localePath = useLocalePath();
const { t } = useI18n();

const {
  steps,
  addStep,
  removeStep,
  phase,
  currentState,
  activeCue,
  results,
  wrongResults,
  hitCount,
  errorKey,
  containerRef,
  isConnected,
  reconnect,
  start,
  abort,
  backToEditor,
} = useModelEval();

const canStart = computed(() => phase.value === 'setup' && steps.value.length > 0 && isConnected.value);

const onStart = () => {
  void start();
};
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
        {{ t('machineLearning.modelEval.back') }}
      </NuxtLink>
    </div>

    <section class="glass-card p-md sm:p-x-lg mb-x-lg relative overflow-hidden">
      <div
        class="bg-success/5 pointer-events-none absolute -right-20 -top-20 h-[240px] w-[240px] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div class="relative z-10">
        <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
          {{ t('machineLearning.modelEval.kicker') }}
        </p>
        <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
          {{ t('machineLearning.modelEval.title') }}
        </h1>
        <p class="text-body-md mt-xx-sm text-on-surface-dim">
          {{ t('machineLearning.modelEval.subtitle') }}
        </p>
      </div>
    </section>

    <ModelEvalSummary
      v-if="phase === 'summary'"
      :results="results"
      :wrong-results="wrongResults"
      :hit-count="hitCount"
      @back="backToEditor"
    />

    <div
      v-else
      class="gap-x-lg flex flex-col"
    >
      <ModelEvalBuilder
        :steps="steps"
        :disabled="phase !== 'setup'"
        @add="addStep"
        @remove="removeStep"
      />

      <section class="glass-card p-md sm:p-x-lg">
        <h2 class="text-heading-sm text-on-surface font-display font-bold">
          {{ t('machineLearning.modelEval.modelTitle') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-xx-sm">
          {{ t('machineLearning.modelEval.modelHint') }}
        </p>
        <p
          class="text-body-sm mt-sm"
          :class="isConnected ? 'text-success' : 'text-on-surface-dim'"
          role="status"
        >
          {{ isConnected ? t('machineLearning.modelEval.modelReady') : t('machineLearning.modelEval.modelWaiting') }}
        </p>
      </section>

      <p
        v-if="!isConnected"
        class="text-body-sm text-error"
        role="status"
      >
        {{ t('machineLearning.modelEval.errors.bridgeOffline') }}
      </p>
      <p
        v-else-if="errorKey"
        class="text-body-sm text-error"
        role="alert"
      >
        {{ t(errorKey) }}
      </p>

      <div class="gap-sm flex flex-wrap items-center">
        <AppButton
          :disabled="!canStart"
          @click="onStart"
        >
          {{ t('machineLearning.modelEval.start') }}
        </AppButton>
        <AppButton
          v-if="!isConnected"
          variant="secondary"
          @click="reconnect"
        >
          {{ t('machineLearning.modelEval.reconnect') }}
        </AppButton>
      </div>
    </div>

    <div
      v-if="phase === 'running'"
      ref="containerRef"
      class="model-eval-stage fixed inset-0 z-[9999] select-none bg-black"
    >
      <ModelEvalRunner
        :current-state="currentState"
        :active-cue="activeCue"
        @abort="abort"
      />
    </div>
  </div>
</template>

<style scoped>
.model-eval-stage {
  -webkit-user-select: none;
}
</style>
