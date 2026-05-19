<script setup lang="ts">
import { useBciController } from '../../../../../app/composables/useBciController';

defineOptions({ name: 'BlockSlideGame' });

const props = defineProps<{
  controlMode?: 'bci' | 'manual';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();

const position = ref(0);
const MAX_BOUND = 300;
const STEP = 60;
const KEYBOARD_CONFIDENCE = 0.85;

const moveLeft = (confidence = KEYBOARD_CONFIDENCE) => {
  const delta = STEP * Math.min(1, Math.max(0, confidence));
  position.value = Math.max(-MAX_BOUND, position.value - delta);
};

const moveRight = (confidence = KEYBOARD_CONFIDENCE) => {
  const delta = STEP * Math.min(1, Math.max(0, confidence));
  position.value = Math.min(MAX_BOUND, position.value + delta);
};

const reset = () => {
  position.value = 0;
};

const { currentCommand, currentConfidence, isConnected, onCommand } = useBciController();

const isBciMode = computed(() => props.controlMode !== 'manual');

onCommand('RIGHT_HAND', (confidence) => {
  if (isBciMode.value) moveRight(confidence);
});
onCommand('LEFT_HAND', (confidence) => {
  if (isBciMode.value) moveLeft(confidence);
});

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    moveLeft(KEYBOARD_CONFIDENCE);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    moveRight(KEYBOARD_CONFIDENCE);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    emit('close');
  } else if (e.key === 'Space' || e.key === ' ') {
    e.preventDefault();
    reset();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="bg-surface text-on-surface fixed inset-0 z-[100] flex flex-col overflow-hidden antialiased">
    <div
      class="px-md py-x-sm text-body-x-sm gap-x-md gap-y-sm bg-surface-container border-on-surface/[0.08] flex flex-shrink-0 flex-wrap items-center justify-between border-b"
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
        <span class="max-sm:sr-only">{{ t('movementExercises.blockSlide.backShort') }}</span>
      </AppButton>

      <div
        class="text-body-x-sm text-on-surface-dim gap-x-md ml-auto flex flex-wrap items-center justify-end font-semibold tabular-nums leading-tight"
      >
        <div
          v-if="isBciMode"
          class="gap-x-sm flex items-center"
        >
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

        <div
          v-else
          class="gap-x-sm flex items-center"
        >
          <Icon
            name="lucide:keyboard"
            size="1.1rem"
            class="text-on-surface-dim/70 shrink-0"
            aria-hidden="true"
          />
          <span class="text-on-surface-dim/70">{{ t('remote.droneHub.manualKicker') }}</span>
        </div>
      </div>
    </div>

    <div class="gap-x-lg px-md pb-xl pt-lg flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto">
      <div class="flex w-full max-w-[900px] flex-col items-center">
        <div class="mb-xl text-center">
          <h2
            class="text-on-surface text-[3rem] font-semibold leading-tight tracking-tight"
            style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
          >
            {{ t('movementExercises.blockSlide.calibrationTitle') }}
          </h2>
          <p
            class="text-on-surface-dim mt-xs max-w-[40rem] text-[1.2rem] font-medium"
            style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif"
          >
            {{
              isBciMode
                ? t('movementExercises.blockSlide.calibrationSubtitle')
                : t('movementExercises.blockSlide.calibrationSubtitleManual')
            }}
          </p>
        </div>

        <div
          class="bg-surface-container border-on-surface/[0.04] mb-x-lg relative flex h-[240px] w-full items-center justify-center overflow-hidden rounded-[40px] border shadow-sm"
        >
          <div class="bg-on-surface/[0.08] absolute h-[30px] w-[2px] rounded-full"></div>
          <div
            class="bg-on-surface absolute flex h-[80px] w-[80px] items-center justify-center rounded-[22px]"
            style="
              transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
              box-shadow: 0 10px 30px -10px rgb(0 0 0 / 30%);
            "
            :style="{ transform: `translateX(${position}px)` }"
          >
            <div class="bg-surface h-1.5 w-1.5 rounded-full"></div>
          </div>
        </div>

        <div class="gap-md flex flex-wrap items-center justify-center">
          <button
            class="px-x-lg py-sm bg-surface-container-highest hover:bg-surface-hover text-body-md border-on-surface/[0.05] text-on-surface rounded-full border font-semibold shadow-sm transition-all active:scale-95"
            type="button"
            @click="moveLeft()"
          >
            {{ t('movementExercises.blockSlide.left') }}
          </button>
          <button
            class="px-md py-sm hover:bg-surface-hover text-body-md text-on-surface-dim rounded-full bg-transparent font-medium transition-all active:scale-95"
            type="button"
            @click="reset"
          >
            {{ t('movementExercises.blockSlide.center') }}
          </button>
          <button
            class="px-x-lg py-sm bg-surface-container-highest hover:bg-surface-hover text-body-md border-on-surface/[0.05] text-on-surface rounded-full border font-semibold shadow-sm transition-all active:scale-95"
            type="button"
            @click="moveRight()"
          >
            {{ t('movementExercises.blockSlide.right') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
