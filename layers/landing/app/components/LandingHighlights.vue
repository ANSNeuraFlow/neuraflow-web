<script setup lang="ts">
const { t } = useI18n();

const items = computed(() => [
  { key: 'streaming', icon: 'material-symbols:sensors' },
  { key: 'training', icon: 'material-symbols:model-training' },
  { key: 'sessions', icon: 'material-symbols:timeline' },
  { key: 'monitoring', icon: 'material-symbols:monitoring' },
]);
</script>

<template>
  <section
    id="highlights"
    class="px-md py-xxx-huge lg:px-xx-lg container mx-auto"
  >
    <div class="gap-md mx-auto flex max-w-3xl flex-col items-center text-center">
      <h2 class="text-heading-x-lg tracking-sm text-on-surface font-semibold">
        {{ t('landing.highlights.title') }}
      </h2>
      <p class="text-body-md text-on-surface-dim">
        {{ t('landing.highlights.description') }}
      </p>
    </div>

    <div class="mt-xx-lg gap-lg grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      <AppCard
        v-for="item in items"
        :key="item.key"
        border
        shadow="sm"
        class="duration-short hover:-translate-y-xx-sm hover:border-accent/35 group h-full transition-all ease-out"
      >
        <div class="gap-md flex h-full flex-col">
          <div class="h-x-huge w-x-huge bg-accent/15 text-accent inline-flex items-center justify-center rounded-sm">
            <Icon
              :name="item.icon"
              size="2rem"
              aria-hidden="true"
            />
          </div>
          <h3 class="text-heading-md text-on-surface font-semibold">
            {{ t(`landing.highlights.items.${item.key}.title`) }}
          </h3>
          <p class="text-body-sm text-on-surface-dim">
            {{ t(`landing.highlights.items.${item.key}.description`) }}
          </p>
        </div>
      </AppCard>
    </div>
  </section>
</template>
