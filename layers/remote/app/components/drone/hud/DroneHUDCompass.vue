<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';

const props = defineProps<{
  heading: number;
}>();

const TAPE_HALF_DEG_MIN = 55;
const TAPE_HALF_DEG_MAX = 95;
const PX_PER_DEG_TARGET = 4.2;

const INSET_PX = 12;

const rootRef = ref<HTMLElement | null>(null);
const trackWidthPx = ref(0);

useResizeObserver(rootRef, (entries) => {
  const w = entries[0]?.contentRect.width ?? 0;
  trackWidthPx.value = w;
});

const innerWidthPx = computed(() => Math.max(0, trackWidthPx.value - 2 * INSET_PX));

const tapeHalfDeg = computed(() => {
  const inner = innerWidthPx.value;
  if (inner < 16) {
    return TAPE_HALF_DEG_MIN;
  }
  const idealHalf = Math.round(inner / (2 * PX_PER_DEG_TARGET));
  return Math.min(TAPE_HALF_DEG_MAX, Math.max(TAPE_HALF_DEG_MIN, idealHalf));
});

const pxPerDeg = computed(() => {
  const inner = innerWidthPx.value;
  if (inner < 16) {
    return 3;
  }
  return inner / (2 * tapeHalfDeg.value);
});

const CARDINALS: Record<number, string> = {
  0: 'N',
  45: 'NE',
  90: 'E',
  135: 'SE',
  180: 'S',
  225: 'SW',
  270: 'W',
  315: 'NW',
};

function tickLabel(deg: number): string | null {
  if (deg % 45 === 0 && CARDINALS[deg]) {
    return CARDINALS[deg];
  }
  if (deg % 10 === 0) {
    return String(deg).padStart(3, '0');
  }
  return null;
}

interface CompassTick {
  deg: number;
  tapeOffset: number;
  tickSize: 'major' | 'mid' | 'minor';
  label: string | null;
}

const ticks = computed<CompassTick[]>(() => {
  const centre = Math.round(props.heading);
  const half = tapeHalfDeg.value;
  const result: CompassTick[] = [];
  for (let tapeOffset = -half; tapeOffset <= half; tapeOffset++) {
    const deg = (((centre + tapeOffset) % 360) + 360) % 360;
    let tickSize: CompassTick['tickSize'] = 'minor';
    if (deg % 10 === 0) {
      tickSize = 'major';
    } else if (deg % 5 === 0) {
      tickSize = 'mid';
    }
    result.push({
      deg,
      tapeOffset,
      tickSize,
      label: tickLabel(deg),
    });
  }
  return result;
});

function tickLeftStyle(tapeOffset: number) {
  const half = tapeHalfDeg.value;
  const leftPx = INSET_PX + (tapeOffset + half) * pxPerDeg.value;
  return {
    left: `${leftPx}px`,
    transform: 'translateX(-50%)',
  };
}

const tickHeights: Record<CompassTick['tickSize'], string> = {
  major: 'h-[0.85rem]',
  mid: 'h-[0.55rem]',
  minor: 'h-[0.32rem]',
};

const headingDisplay = computed(() => String(Math.round(props.heading) % 360).padStart(3, '0'));
</script>

<template>
  <div
    ref="rootRef"
    class="border-on-surface/[0.08] bg-on-surface/[0.03] relative h-[4.8rem] w-full min-w-0 overflow-hidden rounded-xl border"
    role="img"
    :aria-label="`Kurs: ${headingDisplay}°`"
  >
    <template
      v-for="tick in ticks"
      :key="tick.tapeOffset"
    >
      <div
        class="hud-compass-tick absolute bottom-0 flex flex-col items-center"
        :style="tickLeftStyle(tick.tapeOffset)"
      >
        <span
          v-if="tick.label"
          :class="[
            'mb-[0.2rem] max-w-[2.6rem] truncate text-center font-medium leading-none tracking-tight',
            tick.deg % 90 === 0
              ? 'text-body-x-sm text-on-surface font-semibold'
              : tick.deg % 45 === 0
                ? 'text-body-x-sm text-on-surface-dim/85'
                : 'text-on-surface-dim/75 font-mono text-[0.68rem] tabular-nums',
          ]"
          >{{ tick.label }}</span
        >
        <div :class="['bg-on-surface-dim/40 w-px', tickHeights[tick.tickSize]]" />
      </div>
    </template>

    <div class="bg-accent absolute bottom-0 left-1/2 h-[0.7rem] w-[2px] -translate-x-1/2" />

    <div
      class="bg-accent/15 border-accent/30 text-accent absolute left-1/2 top-[0.4rem] -translate-x-1/2 whitespace-nowrap rounded-md border px-[0.6rem] py-[0.15rem] font-mono text-[1.1rem] font-bold tabular-nums leading-none"
    >
      {{ headingDisplay }}°
    </div>
  </div>
</template>

<style scoped>
.hud-compass-tick {
  transition: left 150ms ease-out;
}
</style>
