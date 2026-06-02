<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useSsvepBridge } from '#layers/ssvep/app/composables/useSsvepBridge';
import { useSsvepDetection } from '#layers/ssvep/app/composables/useSsvepDetection';
import { loadStoredRefreshRate } from '#layers/ssvep/app/utils/refresh-rate.utils';
import { useBciController } from '~/composables/useBciController';
import type { BciAction } from '~/models/bci.domain';

const { t } = useI18n();
const refreshRate = ref(loadStoredRefreshRate() ?? 60);
const bridge = useSsvepBridge();
const { currentCommand, currentConfidence, frequencyScores } = useSsvepDetection();
const { onCommand } = useBciController();

definePageMeta({
  layout: 'movement-exercises',
  title: 'ssvep.game.pageTitle',
});

type GamePhase = 'menu' | 'playing' | 'over';

const phase = ref<GamePhase>('menu');
const score = ref(0);
const orbX = ref(50);
const orbY = ref(50);
const targets = ref<Array<{ id: number; x: number; y: number }>>([]);
let targetId = 0;
let rafId = 0;

const SPEED = 0.35;

const spawnTarget = () => {
  targets.value.push({
    id: targetId++,
    x: 15 + Math.random() * 70,
    y: 15 + Math.random() * 70,
  });
};

const applyCommand = (cmd: BciAction | null) => {
  if (phase.value !== 'playing' || !cmd) return;
  if (cmd === 'UP_ACTION') orbY.value = Math.max(5, orbY.value - SPEED);
  if (cmd === 'DOWN_ACTION') orbY.value = Math.min(95, orbY.value + SPEED);
  if (cmd === 'LEFT_HAND') orbX.value = Math.max(5, orbX.value - SPEED);
  if (cmd === 'RIGHT_HAND') orbX.value = Math.min(95, orbX.value + SPEED);
};

watch(currentCommand, (c) => applyCommand(c));

const gameLoop = () => {
  if (phase.value === 'playing') {
    for (let i = targets.value.length - 1; i >= 0; i--) {
      const tg = targets.value[i]!;
      const dx = orbX.value - tg.x;
      const dy = orbY.value - tg.y;
      if (Math.hypot(dx, dy) < 6) {
        score.value += 10;
        targets.value.splice(i, 1);
        spawnTarget();
      }
    }
    if (targets.value.length < 2) spawnTarget();
  }
  rafId = requestAnimationFrame(gameLoop);
};

const startGame = () => {
  score.value = 0;
  orbX.value = 50;
  orbY.value = 50;
  targets.value = [];
  spawnTarget();
  spawnTarget();
  bridge.sendConfig({ refreshRate: refreshRate.value });
  bridge.startDetection();
  phase.value = 'playing';
};

const endGame = () => {
  bridge.stopDetection();
  phase.value = 'over';
  cancelAnimationFrame(rafId);
};

onMounted(() => {
  rafId = requestAnimationFrame(gameLoop);
  onCommand('UP_ACTION', () => applyCommand('UP_ACTION'));
  onCommand('DOWN_ACTION', () => applyCommand('DOWN_ACTION'));
  onCommand('LEFT_HAND', () => applyCommand('LEFT_HAND'));
  onCommand('RIGHT_HAND', () => applyCommand('RIGHT_HAND'));
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  bridge.stopDetection();
});
</script>

<template>
  <div class="relative mx-auto min-h-[calc(100vh-8rem)] w-full max-w-[120rem]">
    <div
      v-if="phase === 'menu'"
      class="gap-x-lg p-md mx-auto flex max-w-[48rem] flex-col"
    >
      <section class="glass-card p-md sm:p-x-lg">
        <h1 class="text-heading-lg text-on-surface font-display font-bold">
          {{ t('ssvep.game.title') }}
        </h1>
        <p class="text-body-md text-on-surface-dim mt-xx-sm">
          {{ t('ssvep.game.subtitle') }}
        </p>
        <SsvepRefreshRateSelector
          v-model="refreshRate"
          class="mt-x-lg"
        />
        <AppButton
          class="mt-x-lg"
          variant="inverse"
          @click="startGame"
        >
          {{ t('ssvep.game.start') }}
        </AppButton>
      </section>
    </div>

    <div
      v-else-if="phase === 'playing'"
      class="relative h-[calc(100vh-6rem)] w-full overflow-hidden"
    >
      <div
        class="from-accent/10 to-success/10 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent"
      />
      <SsvepStimuli
        :refresh-rate="refreshRate"
        fullscreen
        class="pointer-events-none opacity-90"
      />

      <div class="glass-card gap-xs p-sm absolute left-4 top-4 z-20 flex flex-col">
        <span class="text-body-md text-on-surface font-bold">{{ t('ssvep.game.score') }}: {{ score }}</span>
        <span class="text-body-x-sm text-on-surface-dim"> {{ Math.round(currentConfidence * 100) }}% </span>
      </div>

      <AppButton
        class="absolute right-4 top-4 z-20"
        variant="destructive"
        size="sm"
        @click="endGame"
      >
        {{ t('ssvep.game.quit') }}
      </AppButton>

      <div class="absolute inset-0 z-10 m-auto size-full max-w-[56rem]">
        <div
          class="from-accent to-success absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br shadow-[0_0_20px_rgba(59,130,246,0.8)]"
          :style="{ left: `${orbX}%`, top: `${orbY}%` }"
        />
        <div
          v-for="tg in targets"
          :key="tg.id"
          class="border-success bg-success/30 absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          :style="{ left: `${tg.x}%`, top: `${tg.y}%` }"
        />
      </div>

      <SsvepFrequencyDisplay
        class="absolute bottom-4 right-4 z-20 max-w-[16rem]"
        :scores="frequencyScores"
        :refresh-rate="refreshRate"
        :active-command="currentCommand"
      />
    </div>

    <div
      v-else
      class="glass-card p-x-lg mx-auto max-w-[32rem] text-center"
    >
      <h2 class="text-heading-md text-on-surface font-bold">
        {{ t('ssvep.game.over') }}
      </h2>
      <p class="text-heading-lg text-accent mt-md font-display font-bold">{{ score }}</p>
      <AppButton
        class="mt-x-lg"
        variant="inverse"
        @click="phase = 'menu'"
      >
        {{ t('ssvep.game.menu') }}
      </AppButton>
    </div>
  </div>
</template>
