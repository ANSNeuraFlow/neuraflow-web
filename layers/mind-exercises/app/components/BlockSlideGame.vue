<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();

const position = ref(0);
const MAX_BOUND = 300;

const moveLeft = () => {
  position.value = Math.max(-MAX_BOUND, position.value - 60);
};

const moveRight = () => {
  position.value = Math.min(MAX_BOUND, position.value + 60);
};

const reset = () => {
  position.value = 0;
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
  <div
    class="bg-surface text-on-surface fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden antialiased"
  >
    <div class="gap-x-lg flex w-full max-w-[900px] flex-col items-center">
      <div class="mb-xl text-center">
        <h2
          class="text-on-surface text-[3rem] font-semibold leading-tight tracking-tight"
          style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
        >
          {{ t('mindExercises.blockSlide.calibrationTitle') }}
        </h2>
        <p
          class="text-on-surface-dim mt-xs text-[1.2rem] font-medium"
          style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif"
        >
          {{ t('mindExercises.blockSlide.calibrationSubtitle') }}
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

      <div class="gap-md flex items-center">
        <button
          class="px-x-lg py-sm bg-surface-container-highest hover:bg-surface-hover text-body-md border-on-surface/[0.05] text-on-surface rounded-full border font-semibold shadow-sm transition-all active:scale-95"
          @click="moveLeft"
        >
          {{ t('mindExercises.blockSlide.left') }}
        </button>
        <button
          class="px-md py-sm hover:bg-surface-hover text-body-md text-on-surface-dim rounded-full bg-transparent font-medium transition-all active:scale-95"
          @click="reset"
        >
          {{ t('mindExercises.blockSlide.center') }}
        </button>
        <button
          class="px-x-lg py-sm bg-surface-container-highest hover:bg-surface-hover text-body-md border-on-surface/[0.05] text-on-surface rounded-full border font-semibold shadow-sm transition-all active:scale-95"
          @click="moveRight"
        >
          {{ t('mindExercises.blockSlide.right') }}
        </button>
      </div>
    </div>
  </div>
</template>
