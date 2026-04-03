<script setup lang="ts">
const { t } = useI18n();

interface Stat {
  value: string;
  label: string;
  sub: string;
}

const stats = computed<Stat[]>(() => [
  {
    value: t('landing.stats.sampleRate.value'),
    label: t('landing.stats.sampleRate.label'),
    sub: t('landing.stats.sampleRate.sub'),
  },
  {
    value: t('landing.stats.channels.value'),
    label: t('landing.stats.channels.label'),
    sub: t('landing.stats.channels.sub'),
  },
  {
    value: t('landing.stats.latency.value'),
    label: t('landing.stats.latency.label'),
    sub: t('landing.stats.latency.sub'),
  },
  {
    value: t('landing.stats.scale.value'),
    label: t('landing.stats.scale.label'),
    sub: t('landing.stats.scale.sub'),
  },
]);
</script>

<template>
  <section
    id="stats"
    class="py-huge sm:py-x-huge relative"
    aria-label="Platform statistics"
  >
    <!-- Top divider -->
    <div
      class="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-neural-500/30 to-transparent"
      aria-hidden="true"
    />
    <!-- Bottom divider -->
    <div
      class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neural-500/30 to-transparent"
      aria-hidden="true"
    />

    <div class="px-md sm:px-x-lg lg:px-xx-lg mx-auto w-full max-w-landing">
      <div class="gap-xx-lg lg:gap-xxx-lg grid grid-cols-2 lg:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="group text-center"
          role="figure"
          :aria-label="`${stat.label}: ${stat.value}`"
        >
          <div
            class="gradient-text mb-sm text-heading-lg duration-medium sm:text-heading-x-lg lg:text-heading-x-huge font-display font-bold tabular-nums transition-transform group-hover:scale-105"
          >
            {{ stat.value }}
          </div>
          <div class="text-body-sm text-slate-400">{{ stat.label }}</div>
          <div class="mt-xx-sm text-body-x-sm text-slate-600">{{ stat.sub }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
