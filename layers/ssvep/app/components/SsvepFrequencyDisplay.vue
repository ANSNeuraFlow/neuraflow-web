<script setup lang="ts">
import { buildFrequencySetForRefreshRate } from '../utils/refresh-rate.utils';

const props = defineProps<{
  scores: Record<string, number>;
  refreshRate?: number;
  activeCommand?: string | null;
}>();

const { t } = useI18n();

const entries = computed(() => {
  const set = buildFrequencySetForRefreshRate(props.refreshRate ?? 60);
  const max = Math.max(...Object.values(props.scores), 0.001);
  return set.map((e) => ({
    ...e,
    score: props.scores[String(e.frequency)] ?? 0,
    pct: Math.round(((props.scores[String(e.frequency)] ?? 0) / max) * 100),
  }));
});
</script>

<template>
  <div class="glass-card gap-md p-md flex flex-col">
    <h3 class="text-body-md text-on-surface font-semibold">
      {{ t('ssvep.detection.scoresTitle') }}
    </h3>
    <div
      v-for="entry in entries"
      :key="entry.direction"
      class="gap-sm flex items-center"
    >
      <span class="text-body-x-sm text-on-surface-dim w-[4rem] uppercase">{{ entry.direction }}</span>
      <div class="bg-on-surface/[0.08] h-2 flex-1 overflow-hidden rounded-full">
        <div
          class="from-accent to-success h-full rounded-full bg-gradient-to-r transition-all duration-150"
          :style="{ width: `${entry.pct}%` }"
        />
      </div>
      <span class="text-body-x-sm text-on-surface-dim w-[3rem] text-right">{{ entry.frequency }} Hz</span>
    </div>
    <p
      v-if="activeCommand"
      class="text-body-sm text-success font-medium"
    >
      {{ t('ssvep.detection.activeCommand', { command: activeCommand }) }}
    </p>
  </div>
</template>
