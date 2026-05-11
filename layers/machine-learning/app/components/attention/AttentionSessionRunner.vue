<script setup lang="ts">
import type { AttentionClass, AttentionState } from '../../composables/useAttentionCalibration';

const { t } = useI18n();

const props = defineProps<{
  currentState: AttentionState;
  currentTrial: number;
  totalTrials: number;
  activeCue: AttentionClass | '';
  showCue: boolean;
  showTask: boolean;
  showRest: boolean;
  showBreak: boolean;
  showBaseline: boolean;
  showSummary: boolean;
  tutorialMode: boolean;
  baselineSecondsLeft: number;
  cptDigit: string | null;
  collectedTrials: number;
  sessionDurationMs: number;
  soundEnabled: boolean;
}>();

const emit = defineEmits<{
  abort: [];
  continueBreak: [];
  trainModel: [];
  toggleSound: [];
}>();

const spaceFlash = ref(false);
let spaceFlashTimer: ReturnType<typeof setTimeout> | null = null;

const onKeydown = (e: KeyboardEvent) => {
  if (e.code === 'Space' && props.showTask && props.activeCue === 'FOCUS') {
    e.preventDefault();
    spaceFlash.value = true;
    if (spaceFlashTimer) clearTimeout(spaceFlashTimer);
    spaceFlashTimer = setTimeout(() => {
      spaceFlash.value = false;
    }, 150);
  }
};

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  if (spaceFlashTimer) clearTimeout(spaceFlashTimer);
});

const formatDuration = (ms: number) => {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
};

const baselineMinutes = computed(() => Math.floor(props.baselineSecondsLeft / 60));
const baselineSeconds = computed(() => {
  const s = props.baselineSecondsLeft % 60;
  return s < 10 ? `0${s}` : String(s);
});
</script>

<template>
  <!-- Layers are absolute so switching FOCUS/RELAX (cue vs task) does not reflow the fullscreen shell -->
  <div class="relative isolate h-full min-h-0 w-full overflow-hidden">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div
        v-if="showBaseline"
        key="baseline"
        class="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8 text-center"
      >
        <div class="flex flex-col items-center gap-6">
          <div class="relative flex h-[2rem] w-[2rem] shrink-0">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-50" />
            <span class="relative inline-flex h-[2rem] w-[2rem] rounded-full bg-white" />
          </div>
          <p class="text-[2rem] font-light tracking-wide text-white/60 sm:text-[2.4rem]">
            {{ t('machineLearning.attention.runner.baselineInstruction') }}
          </p>
        </div>
        <p class="font-mono text-[6rem] font-thin tabular-nums leading-none text-white sm:text-[9rem]">
          {{ baselineMinutes }}:{{ baselineSeconds }}
        </p>
        <p class="text-body-x-sm font-mono uppercase tracking-widest text-white/30">
          {{ t('machineLearning.attention.runner.baselineHint') }}
        </p>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-100"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div
        v-if="showCue"
        key="cue"
        class="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center"
      >
        <!-- Stable slot: RELAX keeps the same layout box as FOCUS (+ hidden but reserved) -->
        <div
          class="pointer-events-none flex min-h-[13rem] items-center justify-center md:min-h-[18rem]"
          aria-hidden="true"
        >
          <span
            class="select-none text-[12rem] font-light leading-none tracking-tighter text-white md:text-[18rem]"
            :class="activeCue === 'RELAX' ? 'invisible' : ''"
          >
            +
          </span>
        </div>
        <p class="text-[2.4rem] font-semibold tracking-wide text-white sm:text-[3.2rem]">
          {{
            activeCue === 'FOCUS'
              ? t('machineLearning.attention.runner.cueFocusLabel')
              : t('machineLearning.attention.runner.cueRelaxLabel')
          }}
        </p>
        <p
          v-if="tutorialMode"
          class="text-body-sm min-h-[1.25rem] text-white/50"
        >
          {{
            activeCue === 'FOCUS'
              ? t('machineLearning.attention.runner.cueFocusHint')
              : t('machineLearning.attention.runner.cueRelaxHint')
          }}
        </p>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-100"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div
        v-if="showTask"
        key="task"
        class="absolute inset-0 flex flex-col items-center justify-center"
      >
        <template v-if="activeCue === 'FOCUS'">
          <div class="pointer-events-none flex min-h-[22rem] w-full items-center justify-center sm:min-h-[28rem]">
            <p
              class="select-none font-mono text-[18rem] font-thin tabular-nums leading-none text-white sm:text-[26rem]"
            >
              {{ cptDigit ?? '' }}
            </p>
          </div>

          <div class="pointer-events-none absolute bottom-[14%] left-0 right-0 flex flex-col items-center gap-3 px-8">
            <p class="text-body-sm text-center font-mono uppercase tracking-widest text-white/40">
              {{ t('machineLearning.attention.runner.cptInstruction') }}
            </p>
            <div
              class="flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-white/50 transition-all duration-150"
              :class="spaceFlash ? 'border-white/60 bg-white/20 text-white' : 'border-white/10 bg-white/5'"
            >
              {{ t('machineLearning.attention.runner.cptSpaceLabel') }}
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex min-h-[22rem] w-full flex-col items-center justify-center sm:min-h-[28rem]">
            <p class="select-none text-[8rem] font-light leading-none text-white/60 sm:text-[12rem]">·</p>
          </div>
          <p
            class="pointer-events-none absolute bottom-[18%] left-0 right-0 px-8 text-center text-[2rem] font-light tracking-wide text-white/40 sm:text-[2.4rem]"
          >
            {{ t('machineLearning.attention.runner.relaxInstruction') }}
          </p>
        </template>
      </div>
    </Transition>

    <div
      v-if="showRest"
      class="absolute inset-0"
      aria-hidden="true"
    />

    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div
        v-if="showBreak"
        key="break"
        class="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8 text-center"
      >
        <div class="flex flex-col gap-3">
          <p class="text-[2.8rem] font-semibold tracking-tight text-white sm:text-[3.6rem]">
            {{ t('machineLearning.attention.runner.breakTitle') }}
          </p>
          <p class="text-[1.8rem] font-light text-white/60">
            {{ t('machineLearning.attention.runner.breakSubtitle', { done: collectedTrials, total: totalTrials }) }}
          </p>
        </div>
        <AppButton
          size="lg"
          @click="emit('continueBreak')"
        >
          {{ t('machineLearning.attention.runner.breakContinue') }}
        </AppButton>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div
        v-if="showSummary"
        key="summary"
        class="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8 text-center"
      >
        <div class="flex flex-col gap-3">
          <p class="text-[2.8rem] font-semibold tracking-tight text-white sm:text-[3.6rem]">
            {{ t('machineLearning.attention.runner.summaryTitle') }}
          </p>
          <p class="text-[1.8rem] font-light text-white/60">
            {{ t('machineLearning.attention.runner.summaryTrials', { count: collectedTrials }) }}
            · {{ formatDuration(sessionDurationMs) }}
          </p>
        </div>
        <AppButton
          size="lg"
          @click="emit('trainModel')"
        >
          {{ t('machineLearning.attention.runner.trainModel') }}
        </AppButton>
      </div>
    </Transition>

    <div
      v-if="!showSummary && !showBreak"
      class="bottom-md left-md right-md absolute z-10 flex items-end justify-between opacity-20 transition-opacity hover:opacity-100"
    >
      <div class="text-body-sm space-y-tiny p-sm rounded-lg bg-black/50 font-mono text-white backdrop-blur-md">
        <p
          v-if="tutorialMode"
          class="text-accent font-bold uppercase tracking-widest"
        >
          {{ t('machineLearning.attention.runner.tutorialBadge') }}
        </p>
        <p>{{ t('machineLearning.attention.runner.labelTrial') }}: {{ currentTrial }} / {{ totalTrials }}</p>
        <p>
          {{ t('machineLearning.attention.runner.labelState') }}:
          <span class="text-accent font-bold uppercase">{{ currentState }}</span>
        </p>
        <p v-if="activeCue">{{ t('machineLearning.attention.runner.labelClass') }}: {{ activeCue }}</p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton
          variant="ghost"
          class="text-white hover:bg-white/10"
          :title="
            soundEnabled
              ? t('machineLearning.attention.runner.soundOff')
              : t('machineLearning.attention.runner.soundOn')
          "
          @click="emit('toggleSound')"
        >
          <Icon
            :name="soundEnabled ? 'material-symbols:volume-up-outline' : 'material-symbols:volume-off-outline'"
            size="1.6rem"
          />
        </AppButton>
        <AppButton
          variant="ghost"
          class="hover:text-error hover:bg-error/20 text-white"
          @click="emit('abort')"
        >
          {{ t('machineLearning.attention.runner.abort') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
