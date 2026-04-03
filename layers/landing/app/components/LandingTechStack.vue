<script setup lang="ts">
const { t } = useI18n();

const groups = computed(() => ['frontend', 'backend', 'infrastructure']);
</script>

<template>
  <section
    id="technology"
    class="border-on-surface/8 bg-surface-container/35 border-y"
  >
    <div class="px-md py-xxx-huge lg:px-xx-lg container mx-auto">
      <div class="gap-md flex max-w-3xl flex-col">
        <h2 class="text-heading-x-lg tracking-sm text-on-surface font-semibold">
          {{ t('landing.technology.title') }}
        </h2>
        <p class="text-body-md text-on-surface-dim">
          {{ t('landing.technology.description') }}
        </p>
      </div>

      <div class="mt-xx-lg gap-lg grid grid-cols-1 lg:grid-cols-3">
        <AppCard
          v-for="group in groups"
          :key="group"
          border
          shadow="sm"
          class="h-full"
        >
          <div class="gap-md flex h-full flex-col">
            <p class="text-body-x-sm tracking-x-lg text-accent font-medium">
              {{ t('landing.technology.title') }}
            </p>
            <h3 class="text-heading-md text-on-surface font-semibold">
              {{ t(`landing.technology.groups.${group}.title`) }}
            </h3>
            <p class="text-body-sm text-on-surface-dim">
              {{ t(`landing.technology.groups.${group}.items`) }}
            </p>
          </div>
        </AppCard>
      </div>
    </div>
  </section>
</template>
