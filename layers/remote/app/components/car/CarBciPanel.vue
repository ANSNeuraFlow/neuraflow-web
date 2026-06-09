<script setup lang="ts">
import { useBciController } from '~/composables/useBciController';

const PREDICTION_INTERVAL_MS = 2500;
const PULSE_DURATION_MS = 1250;

const { t } = useI18n();
const { currentCommand, currentConfidence, isConnected } = useBciController();

const containerRef = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);

const isPulsing = ref(false);
const progress = ref(0);

let pulseTimer: ReturnType<typeof setTimeout> | null = null;
let intervalTimer: ReturnType<typeof setInterval> | null = null;
let progressTimer: ReturnType<typeof setInterval> | null = null;
let startTime = Date.now();

const triggerPulse = () => {
  isPulsing.value = true;
  startTime = Date.now();
  progress.value = 0;
  if (pulseTimer) clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => {
    isPulsing.value = false;
  }, PULSE_DURATION_MS);
};

const enterFullscreen = async () => {
  if (!containerRef.value) return;
  await containerRef.value.requestFullscreen().catch((err: unknown) => {
    console.warn('Fullscreen request failed:', err instanceof Error ? err.message : String(err));
  });
};

const exitFullscreen = () => {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  }
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() => {
  triggerPulse();
  intervalTimer = setInterval(triggerPulse, PREDICTION_INTERVAL_MS);
  progressTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    progress.value = Math.min((elapsed / PREDICTION_INTERVAL_MS) * 100, 100);
  }, 50);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  if (pulseTimer) clearTimeout(pulseTimer);
  if (intervalTimer) clearInterval(intervalTimer);
  if (progressTimer) clearInterval(progressTimer);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  if (document.fullscreenElement) void document.exitFullscreen();
});

const detectedDirection = computed(() => {
  if (currentCommand.value === 'LEFT_HAND') return 'left';
  if (currentCommand.value === 'RIGHT_HAND') return 'right';
  return null;
});

const confidencePct = computed(() => Math.round(currentConfidence.value * 100));

const arrowOffsetClass = computed(() =>
  isFullscreen.value ? '-translate-x-[26%] md:-translate-x-[28%]' : '-translate-x-[22%] md:-translate-x-[24%]',
);

const arrowOffsetRightClass = computed(() =>
  isFullscreen.value ? 'translate-x-[26%] md:translate-x-[28%]' : 'translate-x-[22%] md:translate-x-[24%]',
);

const crossSizeClass = computed(() =>
  isFullscreen.value ? 'text-[12rem] md:text-[18rem]' : 'text-[8rem] md:text-[12rem]',
);

const iconSizeClass = computed(() =>
  isFullscreen.value ? 'h-[12rem] w-[12rem] md:h-[22rem] md:w-[22rem]' : 'h-[7rem] w-[7rem] md:h-[12rem] md:w-[12rem]',
);
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'relative flex w-full flex-col overflow-hidden bg-black',
      isFullscreen ? 'fixed inset-0 z-[9999]' : 'glass-card min-h-0 rounded-2xl',
    ]"
  >
    <div class="px-x-lg py-md absolute inset-x-0 top-0 z-10 flex items-center justify-between">
      <div class="gap-sm flex items-center">
        <Icon
          name="material-symbols:psychology-outline"
          size="1.8rem"
          class="shrink-0 text-white/60"
        />
        <span class="text-body-sm font-semibold uppercase tracking-wider text-white/60">
          {{ t('remote.carControl.bciPanel.title') }}
        </span>
      </div>

      <div class="gap-md flex items-center">
        <div class="gap-xs flex items-center">
          <span
            :class="[
              'h-[0.7rem] w-[0.7rem] rounded-full',
              isConnected ? 'bg-success animate-pulse' : 'bg-on-surface-dim/40',
            ]"
          />
          <span class="text-body-x-sm font-mono text-white/50">
            {{ isConnected ? t('remote.carControl.bciPanel.connected') : t('remote.carControl.bciPanel.disconnected') }}
          </span>
        </div>

        <button
          type="button"
          class="cursor-pointer text-white/40 transition-colors duration-150 hover:text-white/80"
          :aria-label="
            isFullscreen
              ? t('remote.carControl.bciPanel.exitFullscreen')
              : t('remote.carControl.bciPanel.enterFullscreen')
          "
          @click="isFullscreen ? exitFullscreen() : enterFullscreen()"
        >
          <Icon
            :name="isFullscreen ? 'material-symbols:fullscreen-exit' : 'material-symbols:fullscreen'"
            size="2rem"
          />
        </button>
      </div>
    </div>

    <div :class="['relative w-full', isFullscreen ? 'min-h-screen flex-1' : 'min-h-[32rem]']">
      <div class="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-center">
        <span :class="[crossSizeClass, 'font-light leading-none tracking-tighter text-white']"> + </span>
      </div>

      <div
        v-show="isPulsing"
        class="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center"
        :class="arrowOffsetClass"
      >
        <Icon
          name="material-symbols:arrow-left-alt-rounded"
          :class="[
            iconSizeClass,
            'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]',
            detectedDirection === 'left' ? 'text-success drop-shadow-[0_0_30px_rgba(74,222,128,0.8)]' : '',
          ]"
        />
      </div>

      <div
        v-show="isPulsing"
        class="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center"
        :class="arrowOffsetRightClass"
      >
        <Icon
          name="material-symbols:arrow-right-alt-rounded"
          :class="[
            iconSizeClass,
            'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]',
            detectedDirection === 'right' ? 'text-success drop-shadow-[0_0_30px_rgba(74,222,128,0.8)]' : '',
          ]"
        />
      </div>

      <div class="gap-sm px-x-lg absolute bottom-[18%] left-0 right-0 z-30 flex flex-col items-center">
        <div
          v-if="detectedDirection"
          class="border-success/30 bg-success/10 px-x-lg py-sm gap-sm flex items-center rounded-xl border backdrop-blur-sm"
        >
          <Icon
            :name="
              detectedDirection === 'left'
                ? 'material-symbols:arrow-left-alt-rounded'
                : 'material-symbols:arrow-right-alt-rounded'
            "
            :size="isFullscreen ? '2.4rem' : '1.8rem'"
            class="text-success shrink-0"
          />
          <span :class="['font-semibold text-white', isFullscreen ? 'text-[2rem] md:text-[2.8rem]' : 'text-body-sm']">
            {{
              detectedDirection === 'left'
                ? t('remote.carControl.bciPanel.detectedLeft')
                : t('remote.carControl.bciPanel.detectedRight')
            }}
          </span>
          <span :class="['font-mono text-white/60', isFullscreen ? 'text-[1.4rem] md:text-[2rem]' : 'text-body-x-sm']">
            {{ confidencePct }}%
          </span>
        </div>
        <div
          v-else
          class="px-x-lg py-sm rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm"
        >
          <span class="text-body-x-sm font-mono text-white/30">
            {{ t('remote.carControl.bciPanel.noDetection') }}
          </span>
        </div>
      </div>
    </div>

    <div class="px-x-lg pb-md absolute inset-x-0 bottom-0 z-10">
      <div class="gap-sm flex items-center">
        <Icon
          name="material-symbols:timer-outline"
          size="1.4rem"
          class="shrink-0 text-white/25"
        />
        <div class="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            class="h-full rounded-full bg-white/25 transition-none"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <span class="text-body-x-sm font-mono tabular-nums text-white/25">
          {{ (PREDICTION_INTERVAL_MS / 1000).toFixed(1) }}s
        </span>
      </div>
    </div>
  </div>
</template>
