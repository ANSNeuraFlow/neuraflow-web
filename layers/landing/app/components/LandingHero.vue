<script setup lang="ts">
const { t } = useI18n();

interface EegChannel {
  label: string;
  color: string;
  value: string;
}

interface EegPaths {
  ch1: string;
  ch2: string;
  ch3: string;
}

const eegChannels: EegChannel[] = [
  { label: 'CH1', color: '#6366f1', value: '+42.3 μV' },
  { label: 'CH2', color: '#22d3ee', value: '-18.7 μV' },
  { label: 'CH3', color: 'rgba(99,102,241,0.5)', value: '+7.2 μV' },
  { label: 'CH4-8', color: 'rgba(255,255,255,0.2)', value: '...' },
];

const generateAnimatedPath = (baseOffset: number, amp: number, freq: number, phase: number): string => {
  let path = `M 0 ${60 + baseOffset}`;
  for (let x = 0; x <= 800; x += 6) {
    const tVal = x / 800 + phase;
    const y =
      60 +
      baseOffset +
      amp * Math.sin(tVal * freq * Math.PI * 2) +
      amp * 0.5 * Math.sin(tVal * freq * 3 * Math.PI) +
      amp * 0.3 * Math.cos(tVal * freq * 7 * Math.PI + baseOffset) +
      amp * 0.15 * Math.sin(tVal * freq * 13 * Math.PI);
    path += ` L ${x} ${Math.max(8, Math.min(112, y))}`;
  }
  return path;
};

const eegPaths = ref<EegPaths>({
  ch1: generateAnimatedPath(0, 22, 4.5, 0),
  ch2: generateAnimatedPath(5, 14, 6.2, 0),
  ch3: generateAnimatedPath(-3, 8, 9.1, 0),
});

const animationFrameId = ref<number>(0);
let phase = 0;

const animateEeg = (): void => {
  phase += 0.015;
  eegPaths.value = {
    ch1: generateAnimatedPath(0, 22, 4.5, phase),
    ch2: generateAnimatedPath(5, 14, 6.2, phase),
    ch3: generateAnimatedPath(-3, 8, 9.1, phase),
  };
  animationFrameId.value = requestAnimationFrame(animateEeg);
};

const handlePrimaryCtaClick = (): void => {
  navigateTo('/register');
};

onMounted(() => {
  animationFrameId.value = requestAnimationFrame(animateEeg);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId.value);
});
</script>

<template>
  <section
    id="home"
    class="pb-xxxx-lg relative flex min-h-screen flex-col items-center overflow-hidden pt-[max(7.2rem,5.6rem)] sm:pt-[max(8rem,6rem)]"
    aria-label="Hero section"
  >
    <!-- Background effects -->
    <div
      class="pointer-events-none absolute inset-0 bg-hero-pattern"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 bg-neural-glow"
      aria-hidden="true"
    />

    <!-- Animated grid -->
    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <svg
        class="absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hero-grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#6366f1"
              stroke-width="1"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#hero-grid)"
        />
      </svg>
    </div>

    <!-- Floating orbs -->
    <div
      class="bg-on-surface/5 pointer-events-none absolute left-1/4 top-1/4 h-64 w-64 animate-pulse-slow rounded-full blur-3xl"
      aria-hidden="true"
    />
    <div
      class="bg-info/10 pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse-slow rounded-full blur-3xl"
      style="animation-delay: 2s"
      aria-hidden="true"
    />

    <div class="px-md sm:px-x-lg lg:px-xx-lg relative z-10 mx-auto w-full max-w-landing flex-1 text-center">
      <!-- Badge -->
      <div class="mb-xx-lg flex justify-center">
        <span
          class="section-label animate-fade-in"
          role="status"
        >
          <span
            class="bg-info h-2 w-2 animate-pulse rounded-full"
            aria-hidden="true"
          />
          {{ t('landing.hero.badge') }}
        </span>
      </div>

      <!-- Title -->
      <h1
        class="mb-xx-lg text-heading-lg tracking-sm sm:text-heading-x-lg lg:text-heading-x-huge font-display font-bold leading-none"
      >
        <span class="text-on-surface block">{{ t('landing.hero.titleLine1') }}</span>
        <span class="gradient-text mt-xx-sm block">{{ t('landing.hero.titleLine2') }}</span>
        <span class="mt-xx-sm text-on-surface block">{{ t('landing.hero.titleLine3') }}</span>
      </h1>

      <!-- Subtitle -->
      <p class="mb-xxx-lg text-body-md sm:text-body-lg text-on-surface-dim mx-auto max-w-landing-copy leading-relaxed">
        {{ t('landing.hero.description') }}
      </p>

      <!-- CTA Buttons -->
      <div class="mb-xxxx-lg gap-md flex flex-col items-center justify-center sm:flex-row">
        <a
          href="#cta"
          class="btn-primary group"
          :aria-label="t('landing.hero.primaryCta')"
          @click.prevent="handlePrimaryCtaClick"
        >
          <span>{{ t('landing.hero.primaryCta') }}</span>
          <svg
            class="h-md w-md group-hover:translate-x-xx-sm transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
        <a
          href="#how-it-works"
          class="btn-secondary group"
          :aria-label="t('landing.hero.secondaryCta')"
        >
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
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ t('landing.hero.secondaryCta') }}</span>
        </a>
      </div>

      <!-- EEG Visualization Card -->
      <div class="relative mx-auto w-full max-w-landing-card animate-float">
        <div class="glass-card p-xx-lg sm:p-xxx-lg shadow-neural-lg">
          <div class="mb-xx-lg gap-md flex flex-wrap items-center justify-between">
            <div class="gap-sm flex items-center">
              <div
                class="bg-success h-2 w-2 animate-pulse rounded-full"
                aria-hidden="true"
              />
              <span class="text-body-x-sm font-mono text-slate-400">
                {{ t('landing.hero.visualSession') }}
              </span>
            </div>
            <div class="gap-sm flex items-center">
              <div class="text-body-x-sm font-mono text-slate-500">{{ t('landing.hero.visualFreq') }}</div>
              <div
                class="px-sm py-xx-sm text-body-x-sm border-on-surface/10 bg-on-surface/5 text-on-surface-dim rounded-lg border font-mono"
              >
                {{ t('landing.hero.visualLive') }}
              </div>
            </div>
          </div>

          <!-- EEG Wave Visualization -->
          <div
            class="p-md sm:p-lg bg-on-surface/5 relative min-h-[16rem] overflow-hidden rounded-lg sm:min-h-[18rem] dark:bg-gray-300"
            role="img"
            :aria-label="t('landing.hero.visualTitle')"
          >
            <svg
              class="h-full w-full"
              viewBox="0 0 800 120"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="wave-gradient-1"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stop-color="#6366f1"
                    stop-opacity="0"
                  />
                  <stop
                    offset="30%"
                    stop-color="#6366f1"
                    stop-opacity="1"
                  />
                  <stop
                    offset="100%"
                    stop-color="#22d3ee"
                    stop-opacity="0.8"
                  />
                </linearGradient>
                <linearGradient
                  id="wave-gradient-2"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stop-color="#22d3ee"
                    stop-opacity="0"
                  />
                  <stop
                    offset="30%"
                    stop-color="#22d3ee"
                    stop-opacity="0.8"
                  />
                  <stop
                    offset="100%"
                    stop-color="#6366f1"
                    stop-opacity="0.6"
                  />
                </linearGradient>
              </defs>
              <path
                :d="eegPaths.ch1"
                fill="none"
                stroke="url(#wave-gradient-1)"
                stroke-width="1.5"
                class="eeg-path"
              />
              <path
                :d="eegPaths.ch2"
                fill="none"
                stroke="url(#wave-gradient-2)"
                stroke-width="1.5"
                class="eeg-path"
                style="opacity: 0.7"
              />
              <path
                :d="eegPaths.ch3"
                fill="none"
                stroke="rgba(99,102,241,0.4)"
                stroke-width="1"
                class="eeg-path"
                style="opacity: 0.5"
              />
              <line
                x1="0"
                y1="60"
                x2="800"
                y2="60"
                stroke="rgba(255,255,255,0.05)"
                stroke-width="1"
                stroke-dasharray="4 4"
              />
            </svg>
          </div>

          <!-- Channel labels -->
          <div class="mt-md gap-md text-body-x-sm flex flex-wrap items-center font-mono">
            <div
              v-for="ch in eegChannels"
              :key="ch.label"
              class="gap-sm flex items-center"
            >
              <div
                class="w-xx-sm h-0.5 rounded"
                :style="{ backgroundColor: ch.color }"
                aria-hidden="true"
              />
              <span class="text-slate-500">{{ ch.label }}</span>
              <span class="font-medium text-slate-300">{{ ch.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div
        class="mt-xxxx-lg flex animate-bounce justify-center"
        aria-hidden="true"
      >
        <div class="gap-sm flex flex-col items-center">
          <span class="text-body-x-sm text-slate-600">{{ t('landing.hero.scrollHint') }}</span>
          <svg
            class="h-md w-md text-slate-600"
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
  </section>
</template>

<style scoped>
.eeg-path {
  transition: d 0.05s linear;
}
</style>
