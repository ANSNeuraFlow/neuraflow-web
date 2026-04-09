<script setup lang="ts">
const { t } = useI18n();

interface Tech {
  name: string;
  icon: string;
  desc: string;
}

interface TechLayer {
  name: string;
  dotColor: string;
  techs: Tech[];
}

interface ArchNode {
  label: string;
  icon: string;
  classes: string;
}

const techLayers: TechLayer[] = [
  {
    name: 'Frontend',
    dotColor: 'bg-accent',
    techs: [
      { name: 'Nuxt 3', icon: 'logos:nuxt-icon', desc: 'Vue.js framework' },
      { name: 'TailwindCSS', icon: 'logos:tailwindcss-icon', desc: 'Utility CSS' },
      { name: 'TypeScript', icon: 'logos:typescript-icon', desc: 'Type safety' },
    ],
  },
  {
    name: 'Backend',
    dotColor: 'bg-on-surface-dim',
    techs: [
      { name: 'NestJS', icon: 'logos:nestjs', desc: 'Node.js framework' },
      { name: 'TypeScript', icon: 'logos:typescript-icon', desc: 'Type safety' },
      { name: 'Kysely', icon: 'mdi:database-search-outline', desc: 'SQL query builder' },
      { name: 'PostgreSQL', icon: 'logos:postgresql', desc: 'Relational DB' },
      { name: 'WebSocket', icon: 'mdi:power-plug-outline', desc: 'Real-time stream' },
    ],
  },
  {
    name: 'Messaging',
    dotColor: 'bg-warning',
    techs: [
      { name: 'Apache Kafka', icon: 'mdi:apache-kafka', desc: 'Event streaming' },
      { name: 'PySpark', icon: 'logos:apache-spark', desc: 'Stream processing' },
      { name: 'HDFS', icon: 'logos:hadoop', desc: 'Distributed storage' },
    ],
  },
  {
    name: 'ML / AI',
    dotColor: 'bg-info',
    techs: [
      { name: 'Ray', icon: 'mingcute:lightning-fill', desc: 'Distributed compute' },
      { name: 'PyTorch', icon: 'logos:pytorch-icon', desc: 'Deep learning' },
      { name: 'S3', icon: 'logos:aws-s3', desc: 'Model artifacts' },
    ],
  },
  {
    name: 'Infrastructure',
    dotColor: 'bg-success',
    techs: [
      { name: 'Docker', icon: 'logos:docker-icon', desc: 'Containerization' },
      { name: 'JWT / JWE', icon: 'logos:jwt-icon', desc: 'Auth & security' },
      { name: 'Swagger', icon: 'logos:swagger', desc: 'API docs' },
    ],
  },
];

const archNodes: ArchNode[] = [
  {
    label: 'OpenBCI',
    icon: 'mdi:brain',
    classes: 'border-on-surface/10 text-on-surface bg-on-surface/5 hover:bg-on-surface/10 hover:border-on-surface/30',
  },
  {
    label: 'WebSocket',
    icon: 'mdi:power-plug-outline',
    classes: 'border-on-surface/10 text-on-surface bg-on-surface/5 hover:bg-on-surface/10 hover:border-on-surface/30',
  },
  {
    label: 'Kafka',
    icon: 'mdi:apache-kafka',
    classes: 'border-on-surface/10 text-on-surface bg-on-surface/5 hover:bg-on-surface/10 hover:border-on-surface/30',
  },
  {
    label: 'Spark',
    icon: 'mdi:lightning-bolt',
    classes: 'border-on-surface/10 text-on-surface bg-on-surface/5 hover:bg-on-surface/10 hover:border-on-surface/30',
  },
  {
    label: 'HDFS',
    icon: 'mdi:database-outline',
    classes: 'border-on-surface/10 text-on-surface bg-on-surface/5 hover:bg-on-surface/10 hover:border-on-surface/30',
  },
  {
    label: 'Ray',
    icon: 'mdi:cpu-64-bit',
    classes: 'border-on-surface/10 text-on-surface bg-on-surface/5 hover:bg-on-surface/10 hover:border-on-surface/30',
  },
  {
    label: 'Model',
    icon: 'mdi:cube-outline',
    classes: 'border-on-surface/10 text-on-surface bg-on-surface/5 hover:bg-on-surface/10 hover:border-on-surface/30',
  },
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
      class="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div class="bg-info/[0.04] absolute -left-64 top-1/3 h-[500px] w-[500px] rounded-full blur-3xl" />
      <div class="bg-info/[0.015] absolute -right-64 top-2/3 h-[400px] w-[400px] rounded-full blur-3xl" />
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
        <h2 class="mt-md mb-md text-heading-md sm:text-heading-lg text-on-surface font-display font-bold">
          {{ t('landing.tech.title') }}
          <span class="gradient-text"> {{ t('landing.tech.titleAccent') }}</span>
          {{ t('landing.tech.titleSuffix') }}
        </h2>
        <p class="text-body-md sm:text-body-lg text-on-surface-dim mx-auto max-w-landing-copy">
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
                <span class="text-body-x-sm text-on-surface-dim/80 font-mono font-medium uppercase tracking-widest">
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
                <Icon
                  :name="tech.icon"
                  class="text-heading-md duration-short leading-none transition-transform group-hover/tech:-translate-y-0.5 group-hover/tech:scale-110"
                  aria-hidden="true"
                />
                <div>
                  <div
                    class="text-body-sm duration-short text-on-surface-dim group-hover/tech:text-on-surface font-medium transition-colors"
                  >
                    {{ tech.name }}
                  </div>
                  <div class="text-body-x-sm text-on-surface-dim">{{ tech.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Architecture diagram -->
      <div class="glass-card mt-xxxx-lg p-xx-lg sm:p-xxx-lg relative overflow-hidden text-center">
        <div
          class="mb-xx-lg relative z-10 flex justify-center"
          aria-hidden="true"
        >
          <div class="gap-sm sm:gap-md flex flex-wrap items-center justify-center">
            <div
              v-for="(node, i) in archNodes"
              :key="node.label"
              class="group/node gap-sm sm:gap-md flex items-center"
            >
              <div
                class="duration-medium gap-xx-sm flex h-24 w-24 flex-col items-center justify-center rounded-xl border backdrop-blur-md transition-all hover:-translate-y-1 hover:scale-105 sm:h-28 sm:w-28"
                :class="node.classes"
              >
                <Icon
                  :name="node.icon"
                  class="h-[2rem] w-[2rem] sm:h-[2.5rem] sm:w-[2.5rem]"
                />
                <span class="text-body-x-sm font-mono font-bold tracking-tight">{{ node.label }}</span>
              </div>

              <!-- Connection arrow -->
              <div
                v-if="i < archNodes.length - 1"
                class="relative hidden items-center justify-center lg:flex"
              >
                <svg
                  class="h-md w-md text-on-surface/20 duration-medium group-hover/node:text-on-surface/50 transition-colors"
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
        </div>
        <p class="text-body-sm text-on-surface-dim font-medium">{{ t('landing.tech.archCaption') }}</p>
      </div>
    </div>
  </section>
</template>
