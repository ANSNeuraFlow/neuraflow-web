<script setup lang="ts">
const { t } = useI18n();

interface Step {
  key: string;
  dotColor: string;
}

const steps: Step[] = [
  { key: 'session', dotColor: 'bg-neural-400' },
  { key: 'streaming', dotColor: 'bg-cyan-400' },
  { key: 'kafka', dotColor: 'bg-orange-400' },
  { key: 'ray', dotColor: 'bg-purple-400' },
  { key: 'model', dotColor: 'bg-green-400' },
];
</script>

<template>
  <section
    id="how-it-works"
    class="py-huge sm:py-x-huge relative overflow-hidden"
    aria-label="How NeuraFlow works"
  >
    <!-- Background -->
    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div class="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-neural-600/5 blur-3xl" />
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          {{ t('landing.howItWorks.sectionLabel') }}
        </span>
        <h2 class="mt-md mb-md text-heading-md sm:text-heading-lg font-display font-bold text-white">
          {{ t('landing.howItWorks.title') }}
          <span class="gradient-text"> {{ t('landing.howItWorks.titleAccent') }}</span>
        </h2>
        <p class="text-body-md sm:text-body-lg mx-auto max-w-landing-copy text-slate-400">
          {{ t('landing.howItWorks.description') }}
        </p>
      </div>

      <!-- Steps -->
      <div class="relative">
        <!-- Desktop connecting line -->
        <div
          class="absolute left-1/2 top-10 hidden h-px w-[calc(100%-8rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-neural-500/30 to-transparent lg:block"
          aria-hidden="true"
        />

        <div class="gap-xx-lg lg:gap-md grid grid-cols-1 lg:grid-cols-5">
          <div
            v-for="(step, index) in steps"
            :key="step.key"
            class="relative flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <!-- Desktop connector dot -->
            <div
              class="absolute left-1/2 top-6 z-10 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neural-500 bg-dark-900 lg:flex"
              aria-hidden="true"
            />

            <!-- Step card -->
            <article
              class="glass-card mt-xx-lg p-xx-lg duration-medium sm:p-xxx-lg w-full transition-all hover:shadow-neural"
              :aria-label="`Step ${index + 1}: ${t(`landing.howItWorks.steps.${step.key}.title`)}`"
            >
              <!-- Step number -->
              <div class="mb-md gap-sm flex items-center">
                <div
                  class="h-x-huge w-x-huge text-body-sm flex flex-shrink-0 items-center justify-center rounded-lg border border-neural-500/30 bg-neural-950/80 font-mono font-bold text-neural-400"
                  aria-hidden="true"
                >
                  {{ String(index + 1).padStart(2, '0') }}
                </div>
                <h3 class="text-body-md font-display font-semibold text-white">
                  {{ t(`landing.howItWorks.steps.${step.key}.title`) }}
                </h3>
              </div>

              <p class="mb-md text-body-sm leading-relaxed text-slate-400">
                {{ t(`landing.howItWorks.steps.${step.key}.description`) }}
              </p>

              <!-- Tech badge -->
              <div class="gap-sm text-body-x-sm flex items-center font-mono">
                <div
                  class="h-1.5 w-1.5 rounded-full"
                  :class="step.dotColor"
                  aria-hidden="true"
                />
                <span class="text-slate-500">{{ t(`landing.howItWorks.steps.${step.key}.tech`) }}</span>
              </div>
            </article>

            <!-- Mobile arrow -->
            <div
              v-if="index < steps.length - 1"
              class="flex w-full items-center justify-center py-2 lg:hidden"
              aria-hidden="true"
            >
              <svg
                class="h-x-lg w-x-lg text-neural-500/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Code snippet example -->
      <div class="glass-card mt-xxxx-lg p-xx-lg lg:p-xxx-lg">
        <div class="mb-xx-lg gap-md flex flex-wrap items-center justify-between">
          <div class="gap-sm flex items-center">
            <div
              class="gap-xx-sm flex"
              aria-hidden="true"
            >
              <div class="h-md w-md rounded-full bg-red-500/70" />
              <div class="h-md w-md rounded-full bg-yellow-500/70" />
              <div class="h-md w-md rounded-full bg-green-500/70" />
            </div>
            <span class="text-body-x-sm font-mono text-slate-500">{{ t('landing.howItWorks.codeFile') }}</span>
          </div>
          <span class="text-body-x-sm font-mono text-neural-400/60">{{ t('landing.howItWorks.codeProtocol') }}</span>
        </div>

        <div class="gap-lg grid grid-cols-1 lg:grid-cols-2">
          <div>
            <p class="mb-sm text-body-x-sm font-mono text-slate-500">
              {{ t('landing.howItWorks.codeExample1Comment') }}
            </p>
            <pre
              class="text-body-x-sm overflow-x-auto font-mono leading-relaxed"
              aria-label="API example: create EEG session"
            ><code><span class="text-neural-400">POST</span> <span class="text-slate-300">/api/v1/sessions</span>
<span class="text-slate-500">Authorization: Bearer &lt;token&gt;</span>

<span class="text-cyan-400">{</span>
  <span class="text-green-400">"deviceName"</span><span class="text-slate-400">: </span><span class="text-yellow-400">"OpenBCI"</span><span class="text-slate-400">,</span>
  <span class="text-green-400">"protocolName"</span><span class="text-slate-400">: </span><span class="text-yellow-400">"LEFT_HAND"</span>
<span class="text-cyan-400">}</span></code></pre>
          </div>
          <div>
            <p class="mb-sm text-body-x-sm font-mono text-slate-500">
              {{ t('landing.howItWorks.codeExample2Comment') }}
            </p>
            <pre
              class="text-body-x-sm overflow-x-auto font-mono leading-relaxed"
              aria-label="API example: dispatch ML training"
            ><code><span class="text-neural-400">POST</span> <span class="text-slate-300">/api/v1/training-jobs</span>
<span class="text-slate-500">Authorization: Bearer &lt;token&gt;</span>

<span class="text-cyan-400">{</span>
  <span class="text-green-400">"sessionIds"</span><span class="text-slate-400">: [</span>
    <span class="text-yellow-400">"019d3458-9c17-..."</span>
  <span class="text-slate-400">]</span>
<span class="text-cyan-400">}</span></code></pre>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
