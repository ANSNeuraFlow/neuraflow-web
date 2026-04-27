<script setup lang="ts">
import { useBciController } from '../../../../app/composables/useBciController';
import { type DodgeGameConfig, useDodgeGame } from '../composables/useDodgeGame';

defineOptions({ name: 'DodgeGame' });

const props = defineProps<{
  config: DodgeGameConfig;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const {
  gameState,
  isNewRecord,
  score,
  highScore,
  moveLeft,
  moveRight,
  initialize,
  startPlaying,
  stop,
  restart,
  handleResize,
} = useDodgeGame(canvasRef, () => props.config);

const { currentCommand, currentConfidence, isConnected, onCommand } = useBciController();

onCommand('LEFT_HAND', () => moveLeft());
onCommand('RIGHT_HAND', () => moveRight());

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  handleResize();
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    moveLeft();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    moveRight();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    emit('close');
  } else if ((e.key === 'r' || e.key === 'R') && gameState.value === 'gameover') {
    e.preventDefault();
    restart();
  } else if (e.key === ' ' && gameState.value === 'ready') {
    e.preventDefault();
    startPlaying();
  }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeCanvas();
  const c = canvasRef.value;
  if (c) initialize(c);
  window.addEventListener('keydown', handleKeyDown);
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  stop();
  window.removeEventListener('keydown', handleKeyDown);
  resizeObserver?.disconnect();
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
        <span class="max-sm:sr-only">{{ t('minigames.dodge.backShort') }}</span>
      </AppButton>

      <div class="gap-x-md sm:gap-x-lg ml-auto flex items-center font-semibold tabular-nums">
        <span>{{ t('minigames.dodge.scoreShort', { score }) }}</span>
        <span class="text-body-x-sm sm:text-body-sm text-on-surface-dim font-medium">
          {{ t('minigames.dodge.bestShort', { score: highScore }) }}
        </span>
        <span
          v-if="isNewRecord && gameState === 'gameover'"
          class="text-body-x-sm"
          aria-live="polite"
          >★</span
        >
        <div class="gap-x-sm text-body-x-sm text-on-surface-dim flex w-full items-center font-medium sm:ml-0 sm:w-auto">
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
            class="opacity-50"
            >BCI: —</span
          >
        </div>
      </div>
    </div>

    <div class="w-full min-w-0">
      <div
        ref="containerRef"
        class="border-on-surface/[0.12] relative min-h-[min(78dvh,52rem)] w-full overflow-hidden rounded-2xl border"
      >
        <canvas
          ref="canvasRef"
          class="absolute inset-0 h-full w-full"
        />

        <Transition name="fade-game">
          <div
            v-if="gameState === 'ready'"
            class="bg-on-surface/55 absolute inset-0 flex items-center justify-center backdrop-blur-sm"
          >
            <AppButton
              variant="inverse"
              size="lg"
              @click="startPlaying"
            >
              {{ t('minigames.dodge.startShort') }}
            </AppButton>
          </div>
        </Transition>

        <Transition name="fade-game">
          <div
            v-if="gameState === 'gameover'"
            class="bg-on-surface/55 gap-md absolute inset-0 flex items-center justify-center backdrop-blur-sm"
          >
            <AppButton
              variant="inverse"
              size="md"
              @click="restart"
            >
              {{ t('minigames.dodge.againShort') }}
            </AppButton>
            <AppButton
              variant="ghost"
              size="md"
              class="border-on-surface/40 border"
              @click="emit('close')"
            >
              {{ t('minigames.dodge.backShort') }}
            </AppButton>
          </div>
        </Transition>
      </div>
    </div>

    <div class="gap-md mx-auto flex w-full max-w-4xl">
      <AppButton
        variant="inverse"
        size="lg"
        class="min-h-[3.25rem] flex-1"
        :aria-label="t('minigames.dodge.left')"
        @pointerdown="moveLeft"
      >
        ←
      </AppButton>
      <AppButton
        variant="inverse"
        size="lg"
        class="min-h-[3.25rem] flex-1"
        :aria-label="t('minigames.dodge.right')"
        @pointerdown="moveRight"
      >
        →
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.fade-game-enter-active,
.fade-game-leave-active {
  transition: opacity 0.25s ease;
}

.fade-game-enter-from,
.fade-game-leave-to {
  opacity: 0;
}
</style>
