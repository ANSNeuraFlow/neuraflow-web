<script setup lang="ts">
import { useSsvepStimuli } from '../composables/useSsvepStimuli';

const props = withDefaults(
  defineProps<{
    refreshRate?: number;
    fullscreen?: boolean;
    showDebug?: boolean;
    cuedDirection?: 'up' | 'down' | 'left' | 'right' | null;
  }>(),
  {
    refreshRate: 60,
    fullscreen: false,
    showDebug: false,
    cuedDirection: null,
  },
);

const containerRef = ref<HTMLElement | null>(null);
const canvasRefs = {
  up: ref<HTMLCanvasElement | null>(null),
  down: ref<HTMLCanvasElement | null>(null),
  left: ref<HTMLCanvasElement | null>(null),
  right: ref<HTMLCanvasElement | null>(null),
};

const { targets, luminanceAt, startTime, measuredFps, tickFps } = useSsvepStimuli(() => props.refreshRate);

const GRID = 8;

function drawCheckerboard(ctx: CanvasRenderingContext2D, size: number, luminance: number) {
  const cell = size / GRID;
  const white = Math.round(255 * luminance);
  const black = Math.round(255 * (1 - luminance));
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? `rgb(${white},${white},${white})` : `rgb(${black},${black},${black})`;
      ctx.fillRect(col * cell, row * cell, cell, cell);
    }
  }
}

function renderFrame() {
  const tSec = (performance.now() - startTime.value) / 1000;
  tickFps();
  for (const entry of targets()) {
    const canvas = canvasRefs[entry.direction].value;
    if (!canvas) continue;
    const parent = canvas.parentElement;
    if (!parent) continue;
    const size = Math.min(parent.clientWidth, parent.clientHeight);
    if (size < 8) continue;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    const lum = luminanceAt(entry.frequency, tSec);
    drawCheckerboard(ctx, size, lum);
  }
  requestAnimationFrame(renderFrame);
}

onMounted(() => {
  requestAnimationFrame(renderFrame);
});

defineExpose({ containerRef });
</script>

<template>
  <div
    ref="containerRef"
    class="gap-sm p-sm relative grid h-full min-h-[24rem] w-full grid-cols-3 grid-rows-3"
    :class="fullscreen ? 'fixed inset-0 z-50 min-h-screen bg-black' : ''"
  >
    <div class="col-start-2 row-start-1 flex items-center justify-center">
      <div
        class="relative flex size-[min(12rem,28vw)] items-center justify-center rounded-lg border-2 transition-shadow"
        :class="
          cuedDirection === 'up' ? 'border-accent shadow-[0_0_24px_rgba(59,130,246,0.6)]' : 'border-on-surface/20'
        "
      >
        <canvas
          :ref="canvasRefs.up"
          class="size-full rounded-md"
          aria-label="SSVEP up"
        />
        <span class="text-body-x-sm text-on-surface-dim absolute -bottom-6">9 Hz</span>
      </div>
    </div>

    <div class="col-start-1 row-start-2 flex items-center justify-center">
      <div
        class="relative flex size-[min(12rem,28vw)] items-center justify-center rounded-lg border-2 transition-shadow"
        :class="
          cuedDirection === 'left' ? 'border-accent shadow-[0_0_24px_rgba(59,130,246,0.6)]' : 'border-on-surface/20'
        "
      >
        <canvas
          :ref="canvasRefs.left"
          class="size-full rounded-md"
          aria-label="SSVEP left"
        />
        <span class="text-body-x-sm text-on-surface-dim absolute -bottom-6">13 Hz</span>
      </div>
    </div>

    <div class="col-start-2 row-start-2 flex items-center justify-center">
      <div class="glass-card px-md py-sm text-center">
        <p class="text-body-sm text-on-surface-dim">
          {{ $t('ssvep.stimuli.focusHint') }}
        </p>
      </div>
    </div>

    <div class="col-start-3 row-start-2 flex items-center justify-center">
      <div
        class="relative flex size-[min(12rem,28vw)] items-center justify-center rounded-lg border-2 transition-shadow"
        :class="
          cuedDirection === 'right' ? 'border-accent shadow-[0_0_24px_rgba(59,130,246,0.6)]' : 'border-on-surface/20'
        "
      >
        <canvas
          :ref="canvasRefs.right"
          class="size-full rounded-md"
          aria-label="SSVEP right"
        />
        <span class="text-body-x-sm text-on-surface-dim absolute -bottom-6">15 Hz</span>
      </div>
    </div>

    <div class="col-start-2 row-start-3 flex items-center justify-center">
      <div
        class="relative flex size-[min(12rem,28vw)] items-center justify-center rounded-lg border-2 transition-shadow"
        :class="
          cuedDirection === 'down' ? 'border-accent shadow-[0_0_24px_rgba(59,130,246,0.6)]' : 'border-on-surface/20'
        "
      >
        <canvas
          :ref="canvasRefs.down"
          class="size-full rounded-md"
          aria-label="SSVEP down"
        />
        <span class="text-body-x-sm text-on-surface-dim absolute -bottom-6">11 Hz</span>
      </div>
    </div>

    <div
      v-if="showDebug"
      class="glass-card text-body-x-sm p-xs text-on-surface-dim absolute bottom-2 right-2 z-10"
    >
      FPS: {{ measuredFps }} · {{ refreshRate }} Hz target
    </div>
  </div>
</template>
