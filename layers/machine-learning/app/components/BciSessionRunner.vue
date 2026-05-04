<script setup lang="ts">
const { t } = useI18n();

type ProtocolState = 'idle' | 'relaxation' | 'cue' | 'execution' | 'rest' | 'iti';

const props = defineProps<{
  currentState: ProtocolState;
  currentTrial: number;
  totalTrials: number;
  activeCue: string;
  showCross: boolean;
  showCue: boolean;
  showBlank: boolean;
  tutorialMode: boolean;
}>();

defineEmits<{ abort: [] }>();

const CUE_ICONS: Record<string, string> = {
  LEFT: 'material-symbols:arrow-left-alt-rounded',
  RIGHT: 'material-symbols:arrow-right-alt-rounded',
  UP: 'material-symbols:arrow-upward-alt-rounded',
  DOWN: 'material-symbols:arrow-downward-alt-rounded',
};

const getCueIcon = (cue: string) => CUE_ICONS[cue] ?? 'material-symbols:help-outline-rounded';

const cueInstructions: Record<string, string> = {
  LEFT: 'machineLearning.bci.runner.cueLeft',
  RIGHT: 'machineLearning.bci.runner.cueRight',
  UP: 'machineLearning.bci.runner.cueUp',
  DOWN: 'machineLearning.bci.runner.cueDown',
};

const showInstruction = computed(
  () => props.tutorialMode && (props.currentState === 'cue' || props.currentState === 'execution'),
);

const instructionKey = computed(() => cueInstructions[props.activeCue] ?? '');
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
        '-translate-y-[80%] md:-translate-y-[90%]': activeCue === 'UP',
        'translate-y-[80%] md:translate-y-[90%]': activeCue === 'DOWN',
      }"
    >
      <Icon
        :name="getCueIcon(activeCue)"
        class="h-[12rem] w-[12rem] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] md:h-[22rem] md:w-[22rem]"
      />
    </div>
  </div>

  <!-- Tutorial instruction overlay -->
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="opacity-0 translate-y-4"
    leave-active-class="transition-all duration-200"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="showInstruction"
      class="gap-sm px-x-lg pointer-events-none absolute bottom-[18%] left-0 right-0 z-30 flex flex-col items-center"
    >
      <p class="text-center text-[2rem] font-light tracking-wide text-white/70 sm:text-[2.8rem]">
        {{ t(instructionKey) }}
      </p>
      <p class="text-body-x-sm font-mono uppercase tracking-widest text-white/30">
        {{ currentState === 'cue' ? t('machineLearning.bci.runner.hint') : t('machineLearning.bci.runner.imagine') }}
      </p>
    </div>
  </Transition>

  <!-- HUD -->
  <div
    class="bottom-md left-md right-md absolute flex items-end justify-between opacity-20 transition-opacity hover:opacity-100"
  >
    <div class="text-body-sm space-y-tiny p-sm rounded-lg bg-black/50 font-mono text-white backdrop-blur-md">
      <p
        v-if="tutorialMode"
        class="text-accent font-bold uppercase tracking-widest"
      >
        {{ t('machineLearning.bci.runner.tutorialBadge') }}
      </p>
      <p>{{ t('machineLearning.bci.runner.labelTrial') }}: {{ currentTrial }} / {{ totalTrials }}</p>
      <p>
        {{ t('machineLearning.bci.runner.labelState') }}:
        <span class="text-accent font-bold uppercase">{{ currentState }}</span>
      </p>
      <p v-if="activeCue">{{ t('machineLearning.bci.runner.labelClass') }}: {{ activeCue }}</p>
    </div>
    <AppButton
      variant="ghost"
      class="hover:text-error hover:bg-error/20 text-white"
      @click="$emit('abort')"
    >
      {{ t('machineLearning.bci.runner.abort') }}
    </AppButton>
  </div>
</template>
