<script setup lang="ts">
definePageMeta({
  layout: 'machine-learning',
  title: 'machineLearning.sessions.focusTitle',
});

const localePath = useLocalePath();
</script>

<template>
  <div class="mx-auto flex w-full max-w-[100rem] flex-col">
    <div class="mb-sm">
      <NuxtLink
        :to="localePath('/machine-learning/sessions')"
        class="text-body-sm text-on-surface-dim hover:text-on-surface duration-short gap-xx-sm inline-flex items-center transition-colors"
      >
        <Icon
          name="material-symbols:arrow-back"
          size="1.6rem"
        />
        {{ $t('machineLearning.sessions.motorImageryBackToChoice') }}
      </NuxtLink>
    </div>

    <section class="glass-card p-md sm:p-x-lg mb-x-lg relative overflow-hidden">
      <div
        class="bg-accent/5 pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div class="relative z-10">
        <div class="gap-md flex items-center">
          <div
            class="bg-accent/10 border-accent/20 flex h-[4.8rem] w-[4.8rem] shrink-0 items-center justify-center rounded-xl border"
          >
            <Icon
              name="material-symbols:self-improvement"
              size="2.4rem"
              class="text-accent"
            />
          </div>
          <div>
            <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
              {{ $t('machineLearning.sessions.choiceKicker') }}
            </p>
            <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
              {{ $t('machineLearning.sessions.focusTitle') }}
            </h1>
          </div>
        </div>
        <p class="text-body-md mt-sm text-on-surface-dim">
          {{ $t('machineLearning.sessions.focusSubtitle') }}
        </p>
      </div>
    </section>

    <section class="glass-card relative overflow-hidden">
      <div
        class="bg-accent/8 pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div
        class="bg-accent/5 pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div class="py-xx-lg px-md sm:px-x-lg relative z-10 flex flex-col items-center text-center">
        <div
          class="bg-accent/10 border-accent/20 mb-x-lg flex h-[8rem] w-[8rem] items-center justify-center rounded-2xl border"
        >
          <Icon
            name="material-symbols:construction"
            size="4rem"
            class="text-accent"
          />
        </div>

        <span
          class="bg-accent/10 text-accent border-accent/20 text-body-x-sm mb-md rounded-full border px-4 py-1.5 font-semibold uppercase tracking-wider"
        >
          {{ $t('machineLearning.sessions.focusBadge') }}
        </span>

        <h2 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
          {{ $t('machineLearning.sessions.focusTitle') }}
        </h2>
        <p class="text-body-md mt-xx-sm text-on-surface-dim max-w-[52rem]">
          {{ $t('machineLearning.sessions.focusSubtitle') }}
        </p>

        <div class="mt-x-lg gap-md grid grid-cols-1 sm:grid-cols-3">
          <div
            v-for="key in ['focusFeature1', 'focusFeature2', 'focusFeature3']"
            :key="key"
            class="bg-on-surface/[0.03] border-on-surface/[0.06] gap-xx-sm p-md flex flex-col items-center rounded-xl border text-center"
          >
            <Icon
              name="material-symbols:check-circle-outline"
              size="2rem"
              class="text-accent mb-xx-sm"
            />
            <span class="text-body-sm text-on-surface-dim">{{ $t(`machineLearning.sessions.${key}`) }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
