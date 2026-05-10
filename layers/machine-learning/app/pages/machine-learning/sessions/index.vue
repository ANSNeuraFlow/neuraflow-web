<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
definePageMeta({
  layout: 'machine-learning',
  title: 'machineLearning.sessions.title',
});

const localePath = useLocalePath();
</script>

<template>
  <div class="gap-x-lg mx-auto flex w-full max-w-[120rem] flex-col">
    <section class="glass-card p-md sm:p-x-lg relative overflow-hidden">
      <div
        class="bg-info/5 pointer-events-none absolute -right-20 -top-20 h-[200px] w-[200px] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        class="bg-accent/5 pointer-events-none absolute -bottom-16 -left-16 h-[200px] w-[200px] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div class="relative z-10">
        <p class="text-body-x-sm mb-xx-sm text-on-surface-dim font-semibold uppercase tracking-wider">
          {{ $t('machineLearning.sessions.choiceKicker') }}
        </p>
        <h1 class="text-heading-lg tracking-sm text-on-surface font-display font-bold">
          {{ $t('machineLearning.sessions.choiceTitle') }}
        </h1>
        <p class="text-body-md mt-xx-sm text-on-surface-dim">
          {{ $t('machineLearning.sessions.choiceSubtitle') }}
        </p>
      </div>
    </section>

    <div class="gap-lg grid grid-cols-1 md:grid-cols-2">
      <NuxtLink
        :to="localePath('/machine-learning/sessions/motor-imagery')"
        class="glass-card group relative flex cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      >
        <div
          class="from-info/10 to-accent/5 pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
        <div
          class="bg-info/8 pointer-events-none absolute -right-16 -top-16 h-[200px] w-[200px] rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div class="p-md sm:p-x-lg relative z-10 flex flex-1 flex-col">
          <h2 class="text-heading-md tracking-sm text-on-surface font-display font-bold">
            {{ $t('machineLearning.sessions.motorImageryTitle') }}
          </h2>
          <p class="text-body-sm mt-xx-sm text-on-surface-dim flex-1">
            {{ $t('machineLearning.sessions.motorImagerySubtitle') }}
          </p>

          <ul class="mt-md gap-sm flex flex-col">
            <li
              v-for="key in ['motorImageryFeature1', 'motorImageryFeature2', 'motorImageryFeature3']"
              :key="key"
              class="gap-sm flex items-center"
            >
              <Icon
                name="material-symbols:check-circle-outline"
                size="1.6rem"
                class="text-on-surface-dim shrink-0"
              />
              <span class="text-body-sm text-on-surface-dim">{{ $t(`machineLearning.sessions.${key}`) }}</span>
            </li>
          </ul>

          <div class="border-on-surface/[0.08] mt-x-lg pt-md flex items-center justify-between border-t">
            <span class="text-body-sm text-on-surface font-semibold">
              {{ $t('machineLearning.sessions.motorImageryCta') }}
            </span>
            <Icon
              name="material-symbols:arrow-forward"
              size="2rem"
              class="text-on-surface-dim transition-transform duration-200 group-hover:translate-x-1"
            />
          </div>
        </div>
      </NuxtLink>

      <NuxtLink
        :to="localePath('/machine-learning/sessions/focus')"
        class="glass-card group relative flex cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      >
        <div
          class="from-accent/10 to-info/5 pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
        <div
          class="bg-accent/8 pointer-events-none absolute -left-16 -top-16 h-[200px] w-[200px] rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div class="p-md sm:p-x-lg relative z-10 flex flex-1 flex-col">
          <h2 class="text-heading-md tracking-sm text-on-surface font-display font-bold">
            {{ $t('machineLearning.sessions.focusTitle') }}
          </h2>
          <p class="text-body-sm mt-xx-sm text-on-surface-dim flex-1">
            {{ $t('machineLearning.sessions.focusSubtitle') }}
          </p>

          <ul class="mt-md gap-sm flex flex-col">
            <li
              v-for="key in ['focusFeature1', 'focusFeature2', 'focusFeature3']"
              :key="key"
              class="gap-sm flex items-center"
            >
              <Icon
                name="material-symbols:check-circle-outline"
                size="1.6rem"
                class="text-on-surface-dim shrink-0"
              />
              <span class="text-body-sm text-on-surface-dim">{{ $t(`machineLearning.sessions.${key}`) }}</span>
            </li>
          </ul>

          <div class="border-on-surface/[0.08] mt-x-lg pt-md flex items-center justify-between border-t">
            <span class="text-body-sm text-on-surface font-semibold">
              {{ $t('machineLearning.sessions.focusCta') }}
            </span>
            <Icon
              name="material-symbols:arrow-forward"
              size="2rem"
              class="text-on-surface-dim transition-transform duration-200 group-hover:translate-x-1"
            />
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
