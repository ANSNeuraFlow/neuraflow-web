<script setup lang="ts">
import type { EvalCue, EvalProtocolState } from '../../composables/useModelEval';

const props = defineProps<{
  currentState: EvalProtocolState;
  activeCue: EvalCue | '';
}>();

defineEmits<{ abort: [] }>();

const { t } = useI18n();

const showCross = computed(() => ['relaxation', 'cue', 'execution'].includes(props.currentState));
const showCue = computed(() => props.currentState === 'cue' || props.currentState === 'execution');
const showBlank = computed(() => props.currentState === 'rest' || props.currentState === 'iti');

const cueIcon = (cue: EvalCue | '') =>
  cue === 'RIGHT' ? 'material-symbols:arrow-right-alt-rounded' : 'material-symbols:arrow-left-alt-rounded';
</script>

<template>
  <div
    v-if="!showBlank"
    class="relative flex h-full w-full items-center justify-center"
  >
    <div
      v-show="showCross"
      class="pointer-events-none absolute z-10 select-none text-[12rem] font-light leading-none tracking-tighter text-white md:text-[18rem]"
    >
      +
    </div>

    <div
      v-show="showCue"
      class="pointer-events-none absolute z-20 flex select-none items-center justify-center"
      :class="{
        '-translate-x-[80%] md:-translate-x-[90%]': activeCue === 'LEFT',
        'translate-x-[80%] md:translate-x-[90%]': activeCue === 'RIGHT',
      }"
    >
      <Icon
        :name="cueIcon(activeCue)"
        class="h-[12rem] w-[12rem] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] md:h-[22rem] md:w-[22rem]"
      />
    </div>
  </div>

  <div class="bottom-md right-md absolute z-40">
    <button
      type="button"
      class="hover:text-error hover:bg-error/20 rounded-lg p-2 text-white"
      :aria-label="t('machineLearning.modelEval.runner.abort')"
      @click="$emit('abort')"
    >
      <Icon
        name="material-symbols:close"
        class="h-8 w-8"
      />
    </button>
  </div>
</template>
