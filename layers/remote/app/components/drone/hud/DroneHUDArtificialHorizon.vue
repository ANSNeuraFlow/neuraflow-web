<script setup lang="ts">
const props = defineProps<{
  pitch: number;
  roll: number;
}>();

const ahiId = useId().replace(/:/g, '');

const worldTransform = computed(() => `rotate(${-props.roll}) translate(0, ${props.pitch * 2.5})`);

const PITCH_LINES = [-20, -15, -10, -5, 5, 10, 15, 20] as const;

const BANK_ARC_R = 48;
const BANK_SCALE_ANGLES = [-60, -45, -30, -20, -10, 10, 20, 30, 45, 60] as const;

const PITCH_MAJOR_HALF = 42;
const PITCH_MINOR_HALF = 20;
const PITCH_LABEL_X = 48;

function bankScaleTick(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  const len = Math.abs(angleDeg) % 30 === 0 ? 7 : 4;
  const sinA = Math.sin(rad);
  const cosA = Math.cos(rad);
  return {
    x1: BANK_ARC_R * sinA,
    y1: -BANK_ARC_R * cosA,
    x2: (BANK_ARC_R - len) * sinA,
    y2: -(BANK_ARC_R - len) * cosA,
  };
}

const bankPointerPoints = computed(() => {
  const rad = (props.roll * Math.PI) / 180;
  const cx = BANK_ARC_R * Math.sin(rad);
  const cy = -BANK_ARC_R * Math.cos(rad);
  const rx = -Math.sin(rad);
  const ry = Math.cos(rad);
  const tx = Math.cos(rad);
  const ty = Math.sin(rad);
  const half = 4;
  const depth = 8;
  return [
    [cx - tx * half, cy - ty * half],
    [cx + tx * half, cy + ty * half],
    [cx + rx * depth, cy + ry * depth],
  ]
    .map(([x, y]) => `${x!.toFixed(2)},${y!.toFixed(2)}`)
    .join(' ');
});

const SKY_NEAR = '#adccff';
const SKY_FAR = '#4f8fe6';
const GROUND = '#6b8c1f';
const REF_COLOR = '#dc2626';

const fmt = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}°`;
</script>

<template>
  <div class="border-on-surface/[0.08] min-w-0 flex-1 overflow-hidden rounded-xl border">
    <svg
      class="h-full w-full"
      viewBox="-100 -112 200 224"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      :aria-label="`Pochylenie ${pitch.toFixed(1)}°, przechylenie ${roll.toFixed(1)}°`"
    >
      <defs>
        <linearGradient
          :id="`sky-grad-${ahiId}`"
          x1="0"
          y1="1"
          x2="0"
          y2="0"
        >
          <stop
            offset="0%"
            :stop-color="SKY_NEAR"
          />
          <stop
            offset="100%"
            :stop-color="SKY_FAR"
          />
        </linearGradient>

        <clipPath :id="`ahi-clip-${ahiId}`">
          <rect
            x="-300"
            y="-300"
            width="600"
            height="600"
          />
        </clipPath>
      </defs>

      <g :clip-path="`url(#ahi-clip-${ahiId})`">
        <g
          class="ahi-world"
          :transform="worldTransform"
        >
          <rect
            x="-300"
            y="-400"
            width="600"
            height="400"
            :fill="`url(#sky-grad-${ahiId})`"
          />
          <rect
            x="-300"
            y="0"
            width="600"
            height="400"
            :fill="GROUND"
          />

          <line
            x1="-300"
            y1="0"
            x2="300"
            y2="0"
            stroke="white"
            stroke-width="1.5"
            opacity="0.9"
          />

          <template
            v-for="deg in PITCH_LINES"
            :key="`pl-${deg}`"
          >
            <g :transform="`translate(0, ${-deg * 2.5})`">
              <line
                :x1="deg % 10 === 0 ? -PITCH_MAJOR_HALF : -PITCH_MINOR_HALF"
                y1="0"
                :x2="deg % 10 === 0 ? PITCH_MAJOR_HALF : PITCH_MINOR_HALF"
                y2="0"
                stroke="white"
                stroke-width="1"
                opacity="0.75"
              />
              <template v-if="deg % 10 === 0">
                <text
                  :x="-PITCH_LABEL_X"
                  y="0.5"
                  dominant-baseline="middle"
                  text-anchor="end"
                  fill="white"
                  opacity="0.85"
                  font-size="8"
                  font-family="monospace"
                >
                  {{ Math.abs(deg) }}
                </text>
                <text
                  :x="PITCH_LABEL_X"
                  y="0.5"
                  dominant-baseline="middle"
                  text-anchor="start"
                  fill="white"
                  opacity="0.85"
                  font-size="8"
                  font-family="monospace"
                >
                  {{ Math.abs(deg) }}
                </text>
              </template>
            </g>
          </template>
        </g>
      </g>

      <path
        :d="`M ${-BANK_ARC_R},0 A ${BANK_ARC_R},${BANK_ARC_R} 0 0 1 ${BANK_ARC_R},0`"
        fill="none"
        stroke="white"
        stroke-width="1"
        opacity="0.35"
      />

      <template
        v-for="angle in BANK_SCALE_ANGLES"
        :key="`bs-${angle}`"
      >
        <line
          :x1="bankScaleTick(angle).x1"
          :y1="bankScaleTick(angle).y1"
          :x2="bankScaleTick(angle).x2"
          :y2="bankScaleTick(angle).y2"
          stroke="white"
          stroke-width="1.2"
          opacity="0.45"
        />
      </template>

      <polygon
        class="ahi-bank-ptr"
        :points="bankPointerPoints"
        :fill="REF_COLOR"
      />

      <g>
        <line
          x1="-34"
          y1="0"
          x2="-15"
          y2="0"
          :stroke="REF_COLOR"
          stroke-width="3"
          stroke-linecap="round"
        />
        <line
          x1="-15"
          y1="0"
          x2="-5"
          y2="4"
          :stroke="REF_COLOR"
          stroke-width="3"
          stroke-linecap="round"
        />
        <circle
          cx="0"
          cy="0"
          r="3.5"
          fill="none"
          :stroke="REF_COLOR"
          stroke-width="2.2"
        />
        <line
          x1="5"
          y1="4"
          x2="15"
          y2="0"
          :stroke="REF_COLOR"
          stroke-width="3"
          stroke-linecap="round"
        />
        <line
          x1="15"
          y1="0"
          x2="34"
          y2="0"
          :stroke="REF_COLOR"
          stroke-width="3"
          stroke-linecap="round"
        />
        <line
          x1="0"
          y1="-10"
          x2="0"
          y2="-4"
          :stroke="REF_COLOR"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </g>

      <text
        x="-82"
        y="-78"
        dominant-baseline="hanging"
        text-anchor="start"
        fill="white"
        opacity="0.65"
        font-size="7.5"
        font-family="monospace"
      >
        P {{ fmt(pitch) }}
      </text>
      <text
        x="82"
        y="-78"
        dominant-baseline="hanging"
        text-anchor="end"
        fill="white"
        opacity="0.65"
        font-size="7.5"
        font-family="monospace"
      >
        R {{ fmt(roll) }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.ahi-world,
.ahi-bank-ptr {
  transition: transform 150ms ease-out;
}
</style>
