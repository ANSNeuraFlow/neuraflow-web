<script setup lang="ts">
import { useBciController } from '../../../../app/composables/useBciController';
import { type NeuroBalanceConfig, useNeuroBalance } from '../composables/useNeuroBalance';

defineOptions({ name: 'NeuroBalanceExercise' });

const props = defineProps<{
  config: NeuroBalanceConfig;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const isFullscreen = ref(false);

const {
  exerciseState,
  focusTime,
  bestStreak,
  sessionTime,
  recoverySecondsRemaining,
  applyLeft,
  applyRight,
  initialize,
  startExercise,
  stop,
  handleResize,
} = useNeuroBalance(canvasRef, () => props.config);

const { currentCommand, currentConfidence, isConnected, onCommand } = useBciController();

onCommand('RIGHT_HAND', (confidence) => applyRight(confidence));
onCommand('LEFT_HAND', (confidence) => applyLeft(confidence));

const KEYBOARD_CONFIDENCE = 0.85;

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  handleResize();
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    emit('close');
    return;
  }
  if (e.key === ' ' && exerciseState.value === 'ready') {
    e.preventDefault();
    startExercise();
    return;
  }
  if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    void toggleFullscreen();
    return;
  }
  if (exerciseState.value === 'active') {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      applyLeft(KEYBOARD_CONFIDENCE);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      applyRight(KEYBOARD_CONFIDENCE);
    }
  }
};

const toggleFullscreen = async () => {
  if (!containerRef.value) return;
  try {
    if (!document.fullscreenElement) {
      await containerRef.value.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch {
    //
  }
};

const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeCanvas();
  initialize();
  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  stop();
  window.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  resizeObserver?.disconnect();
});
</script>

<template>
  <div class="gap-y-md flex w-full min-w-0 flex-col">
    <div
      class="px-md py-x-sm text-body-x-sm gap-x-md gap-y-sm bg-surface-container border-on-surface/[0.08] flex flex-wrap items-center justify-between rounded-xl border"
    >
      <AppButton
        variant="ghost"
        size="sm"
        class="text-on-surface -ml-sm hover:text-on-surface"
        @click="emit('close')"
      >
        <Icon
          name="lucide:arrow-left"
          size="1.25rem"
          class="text-on-surface shrink-0"
        />
        <span class="max-sm:sr-only">{{ t('mindExercises.neuroBalance.backShort') }}</span>
      </AppButton>

      <div
        class="text-body-x-sm text-on-surface-dim gap-x-md sm:gap-x-lg ml-auto flex flex-wrap items-center justify-end font-semibold tabular-nums leading-tight"
      >
        <span>
          {{ t('mindExercises.neuroBalance.focusTime', { s: focusTime }) }}
        </span>
        <span>
          {{ t('mindExercises.neuroBalance.bestStreak', { s: bestStreak }) }}
        </span>
        <span>
          {{ t('mindExercises.neuroBalance.sessionTime', { s: sessionTime }) }}
        </span>

        <div class="gap-x-sm flex items-center">
          <span
            class="size-2 shrink-0 rounded-full"
            :class="isConnected ? 'bg-green-400' : 'bg-red-500'"
            aria-hidden="true"
          />
          <span
            v-if="currentCommand"
            class="tabular-nums"
          >
            BCI: {{ currentCommand }} ({{ Math.round(currentConfidence * 100) }}%)
          </span>
          <span
            v-else
            class="text-on-surface-dim/70"
            >BCI: —</span
          >
        </div>

        <AppButton
          variant="ghost"
          size="sm"
          class="text-on-surface hover:text-on-surface"
          :aria-label="
            isFullscreen
              ? t('mindExercises.neuroBalance.fullscreen.exit')
              : t('mindExercises.neuroBalance.fullscreen.enter')
          "
          @click="toggleFullscreen"
        >
          <Icon
            :name="isFullscreen ? 'lucide:minimize-2' : 'lucide:maximize-2'"
            size="1.3rem"
            class="text-on-surface"
          />
        </AppButton>
      </div>
    </div>

    <div class="w-full min-w-0">
      <div
        ref="containerRef"
        class="bg-surface-container border-on-surface/[0.12] relative min-h-[min(78dvh,52rem)] w-full overflow-hidden rounded-2xl border"
      >
        <canvas
          ref="canvasRef"
          class="absolute inset-0 h-full w-full"
        />

        <Transition name="fade-nb">
          <div
            v-if="exerciseState === 'ready'"
            class="bg-surface/85 px-md absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-md"
          >
            <p class="text-heading-md text-on-surface font-display font-bold">
              {{ t('mindExercises.neuroBalance.ready.title') }}
            </p>
            <p class="text-body-md text-on-surface-dim max-w-[32rem] text-center">
              {{ t('mindExercises.neuroBalance.ready.subtitle') }}
            </p>
            <AppButton
              variant="inverse"
              size="lg"
              @click="startExercise"
            >
              {{ t('mindExercises.neuroBalance.ready.start') }}
            </AppButton>
          </div>
        </Transition>

        <Transition name="fade-nb">
          <div
            v-if="exerciseState === 'recovering'"
            class="bg-surface/80 px-md absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-md"
          >
            <p class="text-heading-sm text-on-surface font-display font-bold drop-shadow-lg">
              {{ t('mindExercises.neuroBalance.recovering.title') }}
            </p>
            <p class="text-body-md text-on-surface-dim max-w-[36rem] text-center drop-shadow">
              {{ t('mindExercises.neuroBalance.recovering.subtitle') }}
            </p>
            <p
              v-if="recoverySecondsRemaining > 0"
              class="text-body-sm text-on-surface/80 tabular-nums"
            >
              {{ t('mindExercises.neuroBalance.recovering.countdown', { s: recoverySecondsRemaining }) }}
            </p>
          </div>
        </Transition>

        <Transition name="fade-nb">
          <div
            v-if="exerciseState === 'complete'"
            class="bg-surface/85 px-md absolute inset-0 flex flex-col items-center justify-center gap-4 backdrop-blur-md"
          >
            <p class="text-heading-md text-on-surface font-display font-bold">
              {{ t('mindExercises.neuroBalance.sessionComplete.title') }}
            </p>
            <p class="text-body-md text-on-surface-dim max-w-[32rem] text-center">
              {{ t('mindExercises.neuroBalance.sessionComplete.subtitle', { s: bestStreak }) }}
            </p>
            <AppButton
              variant="inverse"
              size="md"
              @click="emit('close')"
            >
              {{ t('mindExercises.neuroBalance.sessionComplete.back') }}
            </AppButton>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-nb-enter-active,
.fade-nb-leave-active {
  transition: opacity 0.4s ease;
}

.fade-nb-enter-from,
.fade-nb-leave-to {
  opacity: 0;
}
</style>
