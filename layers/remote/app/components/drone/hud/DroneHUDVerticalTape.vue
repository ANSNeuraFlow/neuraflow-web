<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number;
    label: string;
    unit: string;
    pxPerUnit: number;
    tickStep: number;
    majorEvery: number;
    windowSize: number;
    pointerSide: 'left' | 'right';
    narrow?: boolean;
  }>(),
  {
    pxPerUnit: 10,
    tickStep: 1,
    majorEvery: 5,
    windowSize: 14,
    pointerSide: 'right',
    narrow: false,
  },
);

interface TapeEntry {
  value: number;
  topStyle: string;
  isMajor: boolean;
}

const tapeEntries = computed<TapeEntry[]>(() => {
  const lo = Math.floor(props.value / props.tickStep) * props.tickStep - props.windowSize * props.tickStep;
  const hi = Math.ceil(props.value / props.tickStep) * props.tickStep + props.windowSize * props.tickStep;

  const result: TapeEntry[] = [];
  for (let v = lo; v <= hi; v += props.tickStep) {
    if (v < 0) continue;
    const pxFromCenter = (v - props.value) * props.pxPerUnit;
    const stepIndex = Math.round(v / props.tickStep);
    result.push({
      value: v,
      topStyle: `calc(50% - ${pxFromCenter}px)`,
      isMajor: stepIndex % props.majorEvery === 0,
    });
  }
  return result;
});

const pointerOnLeft = computed(() => props.pointerSide === 'left');

const tapeWidthClass = computed(() => (props.narrow ? 'w-[5.8rem]' : 'w-[6.4rem]'));

const tickBarClass = (isMajor: boolean) => [
  'bg-on-surface-dim/45 h-px shrink-0 rounded-full',
  isMajor ? 'w-[1.45rem]' : 'w-[0.55rem]',
];

const POINTER_GUTTER = '0.9rem';
</script>

<template>
  <div
    :class="[
      'border-on-surface/[0.08] bg-on-surface/[0.03] flex shrink-0 flex-col overflow-hidden rounded-xl border',
      tapeWidthClass,
    ]"
  >
    <div
      class="border-on-surface/[0.06] px-xx-sm py-xx-sm text-body-x-sm gap-x-tiny flex shrink-0 items-center justify-center border-b font-medium leading-snug"
    >
      <span class="text-on-surface-dim shrink-0 whitespace-nowrap">{{ label }}</span>
      <span class="text-on-surface-dim/50 shrink-0 whitespace-nowrap">{{ unit }}</span>
    </div>

    <div class="relative min-h-0 flex-1 overflow-hidden">
      <template
        v-for="entry in tapeEntries"
        :key="entry.value"
      >
        <div
          class="hud-tape-entry pointer-events-none absolute left-0 right-0 flex items-center"
          :style="{
            top: entry.topStyle,
            transform: 'translateY(-50%)',
            ...(pointerOnLeft ? { paddingLeft: POINTER_GUTTER } : { paddingRight: POINTER_GUTTER }),
          }"
        >
          <template v-if="!pointerOnLeft">
            <div class="gap-xx-sm pl-xx-sm flex shrink-0 items-center">
              <div :class="tickBarClass(entry.isMajor)" />
              <div
                class="text-on-surface-dim/70 w-[2.25rem] shrink-0 text-left font-mono text-[0.95rem] tabular-nums leading-none"
              >
                <span v-if="entry.isMajor">{{ entry.value }}</span>
              </div>
            </div>
            <div class="min-w-0 flex-1" />
          </template>

          <template v-else>
            <div class="min-w-0 flex-1" />
            <div class="gap-xx-sm pr-xx-sm flex shrink-0 flex-row-reverse items-center">
              <div :class="tickBarClass(entry.isMajor)" />
              <div
                class="text-on-surface-dim/70 w-[2.35rem] shrink-0 text-right font-mono text-[0.95rem] tabular-nums leading-none"
              >
                <span v-if="entry.isMajor">{{ entry.value }}</span>
              </div>
            </div>
          </template>
        </div>
      </template>

      <div
        class="absolute top-1/2 z-10 -translate-y-1/2"
        :class="pointerOnLeft ? 'left-0' : 'right-0'"
        aria-hidden="true"
      >
        <svg
          class="drop-shadow-[0_0_6px_rgba(59,130,246,0.45)]"
          width="11"
          height="18"
          viewBox="0 0 11 18"
        >
          <polygon
            :points="pointerOnLeft ? '0,0 11,9 0,18' : '11,0 0,9 11,18'"
            class="fill-accent"
          />
        </svg>
      </div>
    </div>

    <div class="border-on-surface/[0.06] py-xx-sm shrink-0 border-t text-center">
      <span class="text-heading-sm text-on-surface font-display font-bold tabular-nums leading-none">
        {{ value.toFixed(1) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.hud-tape-entry {
  transition: top 150ms ease-out;
}
</style>
