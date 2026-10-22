<script setup lang="ts">
import type { EvalStep } from '../../composables/useModelEval';

defineProps<{
  steps: EvalStep[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  add: [cue: 'LEFT' | 'RIGHT'];
  remove: [id: string];
}>();

const { t } = useI18n();

const cueLabel = (cue: EvalStep['cue']) =>
  cue === 'LEFT' ? t('machineLearning.modelEval.directionLeft') : t('machineLearning.modelEval.directionRight');

const cueIcon = (cue: EvalStep['cue']) =>
  cue === 'LEFT' ? 'material-symbols:arrow-left-alt-rounded' : 'material-symbols:arrow-right-alt-rounded';
</script>

<template>
  <section class="glass-card p-md sm:p-x-lg relative overflow-hidden">
    <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
      {{ t('machineLearning.modelEval.builderTitle') }}
    </p>
    <p class="text-heading-sm text-on-surface font-display font-bold">
      {{ t('machineLearning.modelEval.total', { count: steps.length }) }}
    </p>

    <div class="mt-md gap-sm flex flex-wrap">
      <AppButton
        variant="secondary"
        :disabled="disabled"
        @click="emit('add', 'LEFT')"
      >
        <Icon
          name="material-symbols:arrow-left-alt-rounded"
          size="1.8rem"
        />
        {{ t('machineLearning.modelEval.addLeft') }}
      </AppButton>
      <AppButton
        variant="secondary"
        :disabled="disabled"
        @click="emit('add', 'RIGHT')"
      >
        <Icon
          name="material-symbols:arrow-right-alt-rounded"
          size="1.8rem"
        />
        {{ t('machineLearning.modelEval.addRight') }}
      </AppButton>
    </div>

    <p
      v-if="steps.length === 0"
      class="text-body-sm text-on-surface-dim mt-md"
    >
      {{ t('machineLearning.modelEval.empty') }}
    </p>

    <ol
      v-else
      class="mt-md gap-xs flex max-h-[28rem] flex-col overflow-y-auto"
    >
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="border-on-surface/10 px-sm py-xs flex items-center justify-between rounded-xl border"
      >
        <div class="gap-sm flex items-center">
          <span class="text-body-x-sm text-on-surface-dim w-[4.8rem] font-mono">
            {{ t('machineLearning.modelEval.step', { index: index + 1 }) }}
          </span>
          <Icon
            :name="cueIcon(step.cue)"
            size="2rem"
            class="text-on-surface"
          />
          <span class="text-body-sm text-on-surface font-semibold">{{ cueLabel(step.cue) }}</span>
        </div>
        <AppButton
          variant="ghost"
          size="sm"
          :disabled="disabled"
          :aria-label="t('machineLearning.modelEval.remove', { index: index + 1 })"
          @click="emit('remove', step.id)"
        >
          <Icon
            name="material-symbols:close"
            size="1.6rem"
          />
        </AppButton>
      </li>
    </ol>
  </section>
</template>
