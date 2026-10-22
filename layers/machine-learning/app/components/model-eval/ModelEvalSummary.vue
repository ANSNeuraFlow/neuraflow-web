<script setup lang="ts">
import type { EvalCue, EvalTrialResult } from '../../composables/useModelEval';

const props = defineProps<{
  results: EvalTrialResult[];
  wrongResults: EvalTrialResult[];
  hitCount: number;
}>();

defineEmits<{ back: [] }>();

const { t } = useI18n();

const csvCell = (value: string | number) => {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
};

const exportCsv = () => {
  const header = ['trial', 'expected', 'detected', 'confidence', 'correct'];
  const rows = props.results.map((trial) => [
    trial.index,
    trial.expected,
    trial.detected ?? '',
    trial.confidence === null ? '' : trial.confidence.toFixed(3),
    trial.detected === trial.expected ? 1 : 0,
  ]);
  const body = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${body}\n`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 19).replaceAll(':', '-');
  link.href = url;
  link.download = `model-eval-${stamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const directionLabel = (cue: EvalCue | null) => {
  if (cue === 'LEFT') return t('machineLearning.modelEval.directionLeft');
  if (cue === 'RIGHT') return t('machineLearning.modelEval.directionRight');
  return t('machineLearning.modelEval.summary.none');
};

const confidenceLabel = (value: number | null) => (value === null ? '—' : `${Math.round(value * 100)}%`);
</script>

<template>
  <section class="glass-card p-md sm:p-x-lg">
    <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
      {{ t('machineLearning.modelEval.summary.title') }}
    </p>
    <h2 class="text-heading-md tracking-sm text-on-surface font-display font-bold">
      {{ t('machineLearning.modelEval.summary.score', { hits: hitCount, total: results.length }) }}
    </h2>

    <h3 class="text-body-md text-on-surface mt-x-lg font-semibold">
      {{ t('machineLearning.modelEval.summary.wrongTitle') }}
    </h3>

    <p
      v-if="wrongResults.length === 0"
      class="text-body-sm text-success mt-sm"
    >
      {{ t('machineLearning.modelEval.summary.wrongEmpty') }}
    </p>

    <div
      v-else
      class="mt-sm overflow-x-auto"
    >
      <table class="w-full min-w-[36rem] border-collapse text-left">
        <thead>
          <tr class="text-body-x-sm text-on-surface-dim">
            <th class="border-on-surface/10 px-sm py-xs border-b font-medium">
              {{ t('machineLearning.modelEval.summary.colTrial') }}
            </th>
            <th class="border-on-surface/10 px-sm py-xs border-b font-medium">
              {{ t('machineLearning.modelEval.summary.colExpected') }}
            </th>
            <th class="border-on-surface/10 px-sm py-xs border-b font-medium">
              {{ t('machineLearning.modelEval.summary.colDetected') }}
            </th>
            <th class="border-on-surface/10 px-sm py-xs border-b font-medium">
              {{ t('machineLearning.modelEval.summary.colConfidence') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="trial in wrongResults"
            :key="trial.index"
            class="text-body-sm text-on-surface"
          >
            <td class="border-on-surface/10 px-sm py-xs border-b font-mono">{{ trial.index }}</td>
            <td class="border-on-surface/10 px-sm py-xs border-b">{{ directionLabel(trial.expected) }}</td>
            <td class="border-on-surface/10 px-sm py-xs text-error border-b font-semibold">
              {{ directionLabel(trial.detected) }}
            </td>
            <td class="border-on-surface/10 px-sm py-xs border-b font-mono">
              {{ confidenceLabel(trial.confidence) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="gap-sm mt-x-lg flex flex-wrap">
      <AppButton @click="exportCsv">
        {{ t('machineLearning.modelEval.summary.exportCsv') }}
      </AppButton>
      <AppButton
        variant="secondary"
        @click="$emit('back')"
      >
        {{ t('machineLearning.modelEval.summary.back') }}
      </AppButton>
    </div>
  </section>
</template>
