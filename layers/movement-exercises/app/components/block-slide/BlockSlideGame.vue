<script setup lang="ts">
import { CAR_BCI_PREDICTION_INTERVAL_MS, CAR_BCI_PULSE_DURATION_MS } from '#layers/remote/app/models/car-bci.domain';

import { useBciController } from '../../../../../app/composables/useBciController';
import {
  BLOCK_SLIDE_SLOT_COUNT,
  BLOCK_SLIDE_STEPS_FROM_CENTER,
  type BlockSlideBciDisplayMode,
} from '../../models/block-slide.domain';
defineOptions({ name: 'BlockSlideGame' });
const props = withDefaults(
  defineProps<{
    controlMode?: 'bci' | 'manual';
    bciDisplayMode?: BlockSlideBciDisplayMode;
  }>(),
  {
    controlMode: 'bci',
    bciDisplayMode: 'simple',
  },
);
const emit = defineEmits<{
  (e: 'close'): void;
}>();
const { t } = useI18n();
const containerRef = ref<HTMLDivElement | null>(null);
const trackRef = ref<HTMLDivElement | null>(null);
const isFullscreen = ref(false);
const slotOffset = ref(0);
const stepPx = ref(36);
const KEYBOARD_CONFIDENCE = 0.85;
const slotMarkers = Array.from({ length: BLOCK_SLIDE_SLOT_COUNT }, (_, index) => index - BLOCK_SLIDE_STEPS_FROM_CENTER);
const blockOffsetPx = computed(() => slotOffset.value * stepPx.value);
const isPulsing = ref(false);
const progress = ref(0);
let pulseTimer: ReturnType<typeof setTimeout> | null = null;
let intervalTimer: ReturnType<typeof setInterval> | null = null;
let progressTimer: ReturnType<typeof setInterval> | null = null;
let pulseStartTime = Date.now();
const isBciMode = computed(() => props.controlMode !== 'manual');
const showBciCues = computed(() => isBciMode.value && props.bciDisplayMode === 'cues');
const isCentered = computed(() => slotOffset.value === 0);
const updateBounds = () => {
  if (!trackRef.value) return;
  const trackWidth = trackRef.value.clientWidth;
  const blockWidth = trackRef.value.querySelector<HTMLElement>('[data-block]')?.offsetWidth ?? 56;
  const innerPadding = Math.max(24, Math.round(blockWidth * 0.22));
  const travel = Math.max(0, trackWidth - blockWidth - innerPadding * 2);
  stepPx.value = travel / (2 * BLOCK_SLIDE_STEPS_FROM_CENTER);
  slotOffset.value = Math.max(
    -BLOCK_SLIDE_STEPS_FROM_CENTER,
    Math.min(BLOCK_SLIDE_STEPS_FROM_CENTER, slotOffset.value),
  );
};
const moveByConfidence = (direction: 'left' | 'right', confidence: number) => {
  if (confidence < 0.35) return;
  if (direction === 'left') {
    slotOffset.value = Math.max(-BLOCK_SLIDE_STEPS_FROM_CENTER, slotOffset.value - 1);
  } else {
    slotOffset.value = Math.min(BLOCK_SLIDE_STEPS_FROM_CENTER, slotOffset.value + 1);
  }
};
const moveLeft = (confidence = KEYBOARD_CONFIDENCE) => moveByConfidence('left', confidence);
const moveRight = (confidence = KEYBOARD_CONFIDENCE) => moveByConfidence('right', confidence);
const reset = () => {
  slotOffset.value = 0;
};
const { currentCommand, currentConfidence, isConnected, onCommand } = useBciController();
const detectedDirection = computed(() => {
  if (currentCommand.value === 'LEFT_HAND') return 'left';
  if (currentCommand.value === 'RIGHT_HAND') return 'right';
  return null;
});
const confidencePct = computed(() => Math.round(currentConfidence.value * 100));
const clearBciCueTimers = () => {
  if (pulseTimer) {
    clearTimeout(pulseTimer);
    pulseTimer = null;
  }
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  isPulsing.value = false;
  progress.value = 0;
};
const triggerPulse = () => {
  isPulsing.value = true;
  pulseStartTime = Date.now();
  progress.value = 0;
  if (pulseTimer) clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => {
    isPulsing.value = false;
  }, CAR_BCI_PULSE_DURATION_MS);
};
const startBciCueLoop = () => {
  clearBciCueTimers();
  triggerPulse();
  intervalTimer = setInterval(triggerPulse, CAR_BCI_PREDICTION_INTERVAL_MS);
  progressTimer = setInterval(() => {
    const elapsed = Date.now() - pulseStartTime;
    progress.value = Math.min((elapsed / CAR_BCI_PREDICTION_INTERVAL_MS) * 100, 100);
  }, 50);
};
const applyBciMove = (direction: 'left' | 'right', confidence: number) => {
  if (!isBciMode.value) return;
  if (showBciCues.value) {
    if (isPulsing.value) {
      if (direction === 'left') moveLeft(confidence);
      else moveRight(confidence);
    }
    return;
  }
  if (direction === 'left') moveLeft(confidence);
  else moveRight(confidence);
};
onCommand('RIGHT_HAND', (confidence) => applyBciMove('right', confidence));
onCommand('LEFT_HAND', (confidence) => applyBciMove('left', confidence));
const toggleFullscreen = async () => {
  if (!containerRef.value) return;
  try {
    if (!document.fullscreenElement) {
      await containerRef.value.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (err) {
    console.warn('[BlockSlideGame] fullscreen:', err);
  }
};
const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
  void nextTick(updateBounds);
};
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (document.fullscreenElement) {
      e.preventDefault();
      void document.exitFullscreen();
      return;
    }
    e.preventDefault();
    emit('close');
    return;
  }
  if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    void toggleFullscreen();
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    moveLeft(KEYBOARD_CONFIDENCE);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    moveRight(KEYBOARD_CONFIDENCE);
  } else if (e.key === ' ') {
    e.preventDefault();
    reset();
  }
};
let resizeObserver: ResizeObserver | null = null;
watch(
  showBciCues,
  (active) => {
    if (active) startBciCueLoop();
    else clearBciCueTimers();
  },
  { immediate: true },
);
onMounted(() => {
  updateBounds();
  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  if (trackRef.value) {
    resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(trackRef.value);
  }
});
onUnmounted(() => {
  clearBciCueTimers();
  window.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  resizeObserver?.disconnect();
  if (document.fullscreenElement === containerRef.value) {
    void document.exitFullscreen();
  }
});
</script>

<template>
  <div class="gap-y-md flex w-full min-w-0 flex-col">
    <div
      class="px-md py-sm text-body-sm sm:text-body-md gap-x-md gap-y-sm bg-surface-container border-on-surface/[0.08] flex flex-wrap items-center justify-between rounded-xl border"
    >
      <AppButton
        variant="ghost"
        size="sm"
        class="-ml-sm"
        @click="emit('close')"
      >
        <Icon
          name="lucide:arrow-left"
          size="1.5rem"
          class="shrink-0"
        />
        <span class="max-sm:sr-only">{{ t('movementExercises.blockSlide.backShort') }}</span>
      </AppButton>
      <div
        class="text-body-x-sm gap-x-md sm:gap-x-lg sm:text-body-sm ml-auto flex flex-wrap items-center justify-end font-semibold tabular-nums leading-tight"
      >
        <div
          v-if="isBciMode"
          class="gap-x-sm text-on-surface-dim flex w-full items-center font-medium sm:ml-0 sm:w-auto"
        >
          <span
            class="size-2 shrink-0 rounded-full"
            :class="isConnected ? 'bg-success animate-pulse' : 'bg-destructive'"
            aria-hidden="true"
          />
          <span
            v-if="currentCommand"
            class="tabular-nums"
          >
            BCI: {{ currentCommand }} ({{ confidencePct }}%)
          </span>
          <span
            v-else
            class="opacity-50"
          >
            BCI: —
          </span>
        </div>
        <div
          v-else
          class="gap-x-sm text-on-surface-dim flex w-full items-center font-medium sm:ml-0 sm:w-auto"
        >
          <Icon
            name="lucide:keyboard"
            size="1.1rem"
            class="shrink-0 opacity-70"
            aria-hidden="true"
          />
          <span class="opacity-70">{{ t('remote.droneHub.manualKicker') }}</span>
        </div>
        <AppButton
          variant="ghost"
          size="sm"
          class="text-on-surface hover:text-on-surface"
          :aria-label="
            isFullscreen
              ? t('movementExercises.blockSlide.fullscreen.exit')
              : t('movementExercises.blockSlide.fullscreen.enter')
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
        class="block-slide-stage bg-surface-container border-on-surface/[0.12] relative flex w-full flex-col overflow-hidden rounded-2xl border"
      >
        <div class="block-slide-playfield flex flex-1 flex-col items-center justify-center">
          <div class="block-slide-track-zone">
            <div
              v-show="showBciCues && isPulsing"
              class="block-slide-cue-arrow block-slide-cue-arrow-left"
            >
              <Icon
                name="material-symbols:arrow-left-alt-rounded"
                :class="[
                  'block-slide-cue-arrow-icon',
                  detectedDirection === 'left'
                    ? 'text-success drop-shadow-[0_0_30px_rgba(74,222,128,0.8)]'
                    : 'text-on-surface drop-shadow-[0_0_20px_rgb(0_0_0_/_0.35)]',
                ]"
              />
            </div>
            <div
              v-show="showBciCues && isPulsing"
              class="block-slide-cue-arrow block-slide-cue-arrow-right"
            >
              <Icon
                name="material-symbols:arrow-right-alt-rounded"
                :class="[
                  'block-slide-cue-arrow-icon',
                  detectedDirection === 'right'
                    ? 'text-success drop-shadow-[0_0_30px_rgba(74,222,128,0.8)]'
                    : 'text-on-surface drop-shadow-[0_0_20px_rgb(0_0_0_/_0.35)]',
                ]"
              />
            </div>
            <div class="block-slide-layout block-slide-layout-track">
              <div class="block-slide-track-row flex w-full items-center justify-center">
                <div
                  ref="trackRef"
                  class="block-slide-track bg-on-surface/[0.04] border-on-surface/[0.1] relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
                >
                  <div class="bg-on-surface/[0.22] absolute h-[3.4rem] w-[2px] rounded-full" />
                  <div class="pointer-events-none absolute inset-x-[5%] inset-y-0 flex items-center justify-between">
                    <div
                      v-for="slot in slotMarkers"
                      :key="slot"
                      class="h-[0.55rem] w-[2px] rounded-full transition-colors duration-200"
                      :class="slot === slotOffset ? 'bg-on-surface/50' : 'bg-on-surface/18'"
                    />
                  </div>
                  <div
                    data-block
                    class="bg-on-surface absolute left-1/2 flex h-[5.2rem] w-[5.2rem] items-center justify-center rounded-2xl shadow-[0_8px_24px_-10px_rgb(0_0_0_/_0.35)] sm:h-[6rem] sm:w-[6rem]"
                    :style="{
                      transform: `translateX(calc(-50% + ${blockOffsetPx}px))`,
                      transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }"
                  >
                    <div class="bg-surface h-[0.65rem] w-[0.65rem] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="block-slide-layout block-slide-layout-controls">
            <div class="block-slide-controls w-full">
              <div
                v-if="showBciCues"
                class="gap-sm mb-sm flex w-full items-center"
              >
                <Icon
                  name="material-symbols:timer-outline"
                  size="1.4rem"
                  class="text-on-surface-dim/50 shrink-0"
                />
                <div class="bg-on-surface/[0.08] h-[3px] flex-1 overflow-hidden rounded-full">
                  <div
                    class="bg-on-surface/30 h-full rounded-full transition-none"
                    :style="{ width: `${progress}%` }"
                  />
                </div>
                <span class="text-body-x-sm text-on-surface-dim/50 font-mono tabular-nums">
                  {{ (CAR_BCI_PREDICTION_INTERVAL_MS / 1000).toFixed(1) }}s
                </span>
              </div>
              <div class="gap-md grid grid-cols-3">
                <AppButton
                  variant="inverse"
                  size="lg"
                  class="min-h-[3.25rem]"
                  :disabled="slotOffset === -BLOCK_SLIDE_STEPS_FROM_CENTER"
                  @click="moveLeft()"
                >
                  {{ t('movementExercises.blockSlide.left') }}
                </AppButton>
                <AppButton
                  variant="secondary"
                  size="lg"
                  class="min-h-[3.25rem]"
                  :disabled="isCentered"
                  @click="reset"
                >
                  {{ t('movementExercises.blockSlide.center') }}
                </AppButton>
                <AppButton
                  variant="inverse"
                  size="lg"
                  class="min-h-[3.25rem]"
                  :disabled="slotOffset === BLOCK_SLIDE_STEPS_FROM_CENTER"
                  @click="moveRight()"
                >
                  {{ t('movementExercises.blockSlide.right') }}
                </AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.block-slide-stage {
  min-height: clamp(24rem, 40vh, 32rem);
}

.block-slide-playfield {
  gap: clamp(1.25rem, 3vh, 1.75rem);
  padding: clamp(2rem, 5vh, 3.5rem) 0;
}

.block-slide-track-zone {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.block-slide-layout {
  display: flex;
  width: 100%;
  max-width: 44rem;
  flex-direction: column;
  margin-inline: auto;
}

.block-slide-layout-controls {
  gap: 0;
  padding-inline: clamp(1.5rem, 4vw, 20rem);
}

.block-slide-track-row {
  width: calc(100% + 40rem);
  margin-inline: -20rem;
}

.block-slide-cue-arrow {
  pointer-events: none;
  position: absolute;
  top: 50%;
  z-index: 10;
  display: flex;
  transform: translateY(-50%);
}

.block-slide-cue-arrow-left {
  left: clamp(0.75rem, 2vw, 1.5rem);
}

.block-slide-cue-arrow-right {
  right: clamp(0.75rem, 2vw, 1.5rem);
}

.block-slide-cue-arrow-icon {
  height: 6rem;
  width: 6rem;
}

@media (width >= 640px) {
  .block-slide-cue-arrow-icon {
    height: 8rem;
    width: 8rem;
  }
}

@media (width >= 1024px) {
  .block-slide-cue-arrow-icon {
    height: 10rem;
    width: 10rem;
  }
}

.block-slide-track {
  width: 100%;
  height: clamp(8.5rem, 16vh, 11.5rem);
}

@media (width >= 640px) {
  .block-slide-track {
    height: clamp(9.5rem, 18vh, 12.5rem);
  }
}

.block-slide-controls {
  width: 100%;
}

.block-slide-stage:fullscreen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  width: 100vw;
  border: none;
  border-radius: 0;
}

.block-slide-stage:fullscreen .block-slide-playfield {
  display: flex;
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 4vw, 3rem) 0;
}

.block-slide-stage:fullscreen .block-slide-layout-controls {
  padding-inline: clamp(2rem, 5vw, 20rem);
}

.block-slide-stage:fullscreen .block-slide-layout {
  max-width: 52rem;
}

.block-slide-stage:fullscreen .block-slide-cue-arrow-icon {
  height: 12rem;
  width: 12rem;
}

@media (width >= 768px) {
  .block-slide-stage:fullscreen .block-slide-cue-arrow-icon {
    height: 18rem;
    width: 18rem;
  }
}

.block-slide-stage:fullscreen .block-slide-track {
  width: 100%;
  height: clamp(10rem, 20vh, 13.5rem);
}

@media (width >= 640px) {
  .block-slide-stage:fullscreen .block-slide-track {
    height: clamp(11rem, 22vh, 14.5rem);
  }
}
</style>
