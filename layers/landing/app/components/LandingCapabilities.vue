<script setup lang="ts">
import { defineComponent, h } from 'vue';

const { t } = useI18n();

interface Feature {
  key: string;
  iconBg: string;
  iconColor: string;
  icon: ReturnType<typeof defineComponent>;
  tags: string[];
}

const ChartIcon = defineComponent({
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }, [
      h('polyline', { points: '22 12 18 12 15 21 9 3 6 12 2 12' }),
    ]),
});

const BrainIcon = defineComponent({
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 011.98-3A2.5 2.5 0 019.5 2Z',
      }),
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-1.98-3A2.5 2.5 0 0014.5 2Z',
      }),
    ]),
});

const CpuIcon = defineComponent({
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }, [
      h('rect', { x: '4', y: '4', width: '16', height: '16', rx: '2' }),
      h('rect', { x: '9', y: '9', width: '6', height: '6' }),
      h('line', { x1: '9', y1: '1', x2: '9', y2: '4' }),
      h('line', { x1: '15', y1: '1', x2: '15', y2: '4' }),
      h('line', { x1: '9', y1: '20', x2: '9', y2: '23' }),
      h('line', { x1: '15', y1: '20', x2: '15', y2: '23' }),
      h('line', { x1: '20', y1: '9', x2: '23', y2: '9' }),
      h('line', { x1: '20', y1: '14', x2: '23', y2: '14' }),
      h('line', { x1: '1', y1: '9', x2: '4', y2: '9' }),
      h('line', { x1: '1', y1: '14', x2: '4', y2: '14' }),
    ]),
});

const DatabaseIcon = defineComponent({
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }, [
      h('ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }),
      h('path', { d: 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3' }),
      h('path', { d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' }),
    ]),
});

const ZapIcon = defineComponent({
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }, [
      h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }),
    ]),
});

const ShieldIcon = defineComponent({
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      }),
    ]),
});

const features: Feature[] = [
  {
    key: 'streaming',
    iconBg: 'bg-on-surface/5 border border-on-surface/10',
    iconColor: 'text-on-surface-dim',
    icon: ChartIcon,
    tags: ['WebSocket', 'Kafka', '256 Hz', 'OpenBCI'],
  },
  {
    key: 'sessions',
    iconBg: 'bg-on-surface/5 border border-on-surface/10',
    iconColor: 'text-on-surface-dim',
    icon: BrainIcon,
    tags: ['PostgreSQL', 'Session Tracking', 'Protocols'],
  },
  {
    key: 'training',
    iconBg: 'bg-on-surface/5 border border-on-surface/10',
    iconColor: 'text-accent',
    icon: CpuIcon,
    tags: ['Ray Cluster', 'PyTorch', 'S3', 'HDFS'],
  },
  {
    key: 'models',
    iconBg: 'bg-on-surface/5 border border-on-surface/10',
    iconColor: 'text-info',
    icon: DatabaseIcon,
    tags: ['Model Registry', 'Versioning', 'Accuracy Tracking'],
  },
  {
    key: 'spark',
    iconBg: 'bg-on-surface/5 border border-on-surface/10',
    iconColor: 'text-warning',
    icon: ZapIcon,
    tags: ['Apache Spark', 'HDFS', 'Structured Streaming'],
  },
  {
    key: 'security',
    iconBg: 'bg-on-surface/5 border border-on-surface/10',
    iconColor: 'text-success',
    icon: ShieldIcon,
    tags: ['JWT', 'RBAC', 'AES-256-GCM', 'NestJS Guards'],
  },
];
</script>

<template>
  <section
    id="features"
    class="py-huge sm:py-x-huge relative"
    aria-label="Platform features"
  >
    <div class="px-md sm:px-x-lg lg:px-xx-lg relative mx-auto w-full max-w-landing">
      <!-- Section header -->
      <div class="mb-xxxx-lg text-center">
        <span class="section-label mb-md inline-flex">
          <svg
            class="h-md w-md"
            fill="currentColor"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" />
            <path
              d="M8 4.5a.5.5 0 01.5.5v3.25l2.5 1.5a.5.5 0 01-.5.866l-2.75-1.65A.5.5 0 017.5 8.5V5a.5.5 0 01.5-.5z"
            />
          </svg>
          {{ t('landing.features.sectionLabel') }}
        </span>
        <h2 class="mt-md mb-md text-heading-md sm:text-heading-lg text-on-surface font-display font-bold">
          {{ t('landing.features.title') }}
          <span class="gradient-text"> {{ t('landing.features.titleAccent') }}</span>
        </h2>
        <p class="text-body-md sm:text-body-lg text-on-surface-dim mx-auto max-w-landing-copy">
          {{ t('landing.features.description') }}
        </p>
      </div>

      <!-- Feature grid -->
      <div class="gap-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(feature, index) in features"
          :key="feature.key"
          class="glass-card p-xx-lg sm:p-xxx-lg group flex h-full cursor-default flex-col"
          :aria-label="`Feature: ${t(`landing.features.items.${feature.key}.title`)}`"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <!-- Icon -->
          <div
            class="mb-xx-lg h-xxxx-lg w-xxxx-lg duration-medium flex shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
            :class="feature.iconBg"
          >
            <component
              :is="feature.icon"
              class="h-xx-lg w-xx-lg"
              :class="feature.iconColor"
              aria-hidden="true"
            />
          </div>

          <!-- Content -->
          <h3 class="mb-sm text-heading-md text-on-surface font-display font-semibold">
            {{ t(`landing.features.items.${feature.key}.title`) }}
          </h3>
          <p class="text-body-sm text-on-surface-dim leading-relaxed">
            {{ t(`landing.features.items.${feature.key}.description`) }}
          </p>

          <!-- Tags -->
          <div class="mt-md gap-sm flex flex-wrap">
            <span
              v-for="tag in feature.tags"
              :key="tag"
              class="px-sm py-xx-sm text-body-x-sm border-on-surface/10 bg-on-surface/5 text-on-surface-dim rounded-full border font-medium"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
