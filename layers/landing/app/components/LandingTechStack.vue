<script setup lang="ts">
const { t } = useI18n();

interface Tech {
  name: string;
  emoji: string;
  desc: string;
}

interface TechLayer {
  name: string;
  dotColor: string;
  techs: Tech[];
}

interface ArchNode {
  label: string;
  classes: string;
}

const techLayers: TechLayer[] = [
  {
    name: 'Frontend',
    dotColor: 'bg-cyan-400',
    techs: [
      { name: 'Nuxt 3', emoji: '💚', desc: 'Vue.js framework' },
      { name: 'TailwindCSS', emoji: '🎨', desc: 'Utility CSS' },
      { name: 'TypeScript', emoji: '🔷', desc: 'Type safety' },
    ],
  },
  {
    name: 'Backend',
    dotColor: 'bg-neural-400',
    techs: [
      { name: 'NestJS', emoji: '🐈', desc: 'Node.js framework' },
      { name: 'TypeScript', emoji: '🔷', desc: 'Type safety' },
      { name: 'Kysely', emoji: '🗄️', desc: 'SQL query builder' },
      { name: 'PostgreSQL', emoji: '🐘', desc: 'Relational DB' },
      { name: 'WebSocket', emoji: '🔌', desc: 'Real-time stream' },
    ],
  },
  {
    name: 'Messaging',
    dotColor: 'bg-orange-400',
    techs: [
      { name: 'Apache Kafka', emoji: '📨', desc: 'Event streaming' },
      { name: 'PySpark', emoji: '⚡', desc: 'Stream processing' },
      { name: 'HDFS', emoji: '💾', desc: 'Distributed storage' },
    ],
  },
  {
    name: 'ML / AI',
    dotColor: 'bg-purple-400',
    techs: [
      { name: 'Ray', emoji: '☀️', desc: 'Distributed compute' },
      { name: 'PyTorch', emoji: '🔥', desc: 'Deep learning' },
      { name: 'S3', emoji: '🪣', desc: 'Model artifacts' },
    ],
  },
  {
    name: 'Infrastructure',
    dotColor: 'bg-green-400',
    techs: [
      { name: 'Docker', emoji: '🐳', desc: 'Containerization' },
      { name: 'JWT / JWE', emoji: '🔒', desc: 'Auth & security' },
      { name: 'Swagger', emoji: '📖', desc: 'API docs' },
    ],
  },
];

const archNodes: ArchNode[] = [
  { label: 'OpenBCI', classes: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30' },
  { label: 'WebSocket', classes: 'border-neural-500/40 text-neural-400 bg-neural-950/30' },
  { label: 'Kafka', classes: 'border-orange-500/40 text-orange-400 bg-orange-950/30' },
  { label: 'Spark', classes: 'border-orange-500/40 text-orange-400 bg-orange-950/30' },
  { label: 'HDFS', classes: 'border-slate-500/40 text-slate-400 bg-slate-950/30' },
  { label: 'Ray', classes: 'border-purple-500/40 text-purple-400 bg-purple-950/30' },
  { label: 'Model', classes: 'border-green-500/40 text-green-400 bg-green-950/30' },
];
</script>

<template>
  <section
    id="tech"
    class="py-huge sm:py-x-huge relative overflow-hidden"
    aria-label="Technology stack"
  >
    <!-- Background -->
    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-neural-950/20 to-transparent" />
    </div>

    <div class="px-md sm:px-x-lg lg:px-xx-lg relative mx-auto w-full max-w-landing">
      <!-- Section header -->
      <div class="mb-xxxx-lg text-center">
        <span class="section-label mb-md inline-flex">
          <svg
            class="h-md w-md"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          {{ t('landing.tech.sectionLabel') }}
        </span>
        <h2 class="mt-md mb-md text-heading-md sm:text-heading-lg font-display font-bold text-white">
          {{ t('landing.tech.title') }}
          <span class="gradient-text"> {{ t('landing.tech.titleAccent') }}</span>
          {{ t('landing.tech.titleSuffix') }}
        </h2>
        <p class="text-body-md sm:text-body-lg mx-auto max-w-landing-copy text-slate-400">
          {{ t('landing.tech.description') }}
        </p>
      </div>

      <!-- Tech layers -->
      <div class="space-y-md">
        <div
          v-for="layer in techLayers"
          :key="layer.name"
          class="glass-card p-xx-lg sm:p-xxx-lg"
        >
          <div class="gap-md flex flex-col sm:flex-row sm:items-center">
            <!-- Layer label -->
            <div class="w-full flex-shrink-0 sm:w-[18rem]">
              <div class="gap-sm flex items-center">
                <div
                  class="h-2 w-2 rounded-full"
                  :class="layer.dotColor"
                  aria-hidden="true"
                />
                <span class="text-body-x-sm font-mono font-medium uppercase tracking-widest text-slate-500">
                  {{ layer.name }}
                </span>
              </div>
            </div>

            <!-- Tech badges -->
            <div
              class="gap-sm flex flex-1 flex-wrap"
              role="list"
              :aria-label="`Technologies in ${layer.name} layer`"
            >
              <div
                v-for="tech in layer.techs"
                :key="tech.name"
                class="group/tech gap-md px-md py-sm duration-short flex cursor-default items-center rounded-lg border border-white/[0.06] bg-white/[0.03] transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
                role="listitem"
                :aria-label="tech.name"
              >
                <span
                  class="text-heading-md leading-none"
                  aria-hidden="true"
                  >{{ tech.emoji }}</span
                >
                <div>
                  <div
                    class="text-body-sm duration-short font-medium text-slate-200 transition-colors group-hover/tech:text-white"
                  >
                    {{ tech.name }}
                  </div>
                  <div class="text-body-x-sm text-slate-600">{{ tech.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Architecture diagram -->
      <div class="glass-card mt-xxxx-lg p-xx-lg sm:p-xxx-lg text-center">
        <div
          class="mb-xx-lg flex justify-center"
          aria-hidden="true"
        >
          <div class="gap-sm sm:gap-md flex flex-wrap items-center justify-center">
            <div
              v-for="(node, i) in archNodes"
              :key="node.label"
              class="gap-sm sm:gap-md flex items-center"
            >
              <div
                class="px-md py-sm text-body-x-sm duration-medium rounded-lg border font-mono transition-all hover:scale-105"
                :class="node.classes"
              >
                {{ node.label }}
              </div>
              <svg
                v-if="i < archNodes.length - 1"
                class="h-md w-md hidden text-slate-600 sm:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        </div>
        <p class="text-body-sm text-slate-500">{{ t('landing.tech.archCaption') }}</p>
      </div>
    </div>
  </section>
</template>
