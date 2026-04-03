<script setup lang="ts">
const { t } = useI18n();

const steps = computed(() => ['record', 'stream', 'train', 'deploy']);
</script>

<template>
  <section
    id="how-it-works"
    class="px-md py-xxx-huge lg:px-xx-lg container mx-auto"
  >
    <div class="gap-md mx-auto flex max-w-3xl flex-col items-center text-center">
      <h2 class="text-heading-x-lg tracking-sm text-on-surface font-semibold">
        {{ t('landing.howItWorks.title') }}
      </h2>
      <p class="text-body-md text-on-surface-dim">
        {{ t('landing.howItWorks.description') }}
      </p>
    </div>

    <ol class="mt-xx-lg gap-lg grid grid-cols-1 lg:grid-cols-4">
      <li
        v-for="(step, index) in steps"
        :key="step"
        class="relative"
      >
        <AppCard
          border
          shadow="sm"
          class="h-full"
        >
          <div class="gap-md flex h-full flex-col">
            <span
              class="h-x-huge w-x-huge bg-accent/15 text-body-md text-accent inline-flex items-center justify-center rounded-full font-semibold"
            >
              {{ index + 1 }}
            </span>
            <h3 class="text-heading-md text-on-surface font-semibold">
              {{ t(`landing.howItWorks.steps.${step}.title`) }}
            </h3>
            <p class="text-body-sm text-on-surface-dim">
              {{ t(`landing.howItWorks.steps.${step}.description`) }}
            </p>
          </div>
        </AppCard>
      </li>
    </ol>
  </section>
</template>
