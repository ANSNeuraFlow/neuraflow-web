<script setup lang="ts">
const { t } = useI18n();

const items = computed(() => [
  { key: 'capture', icon: 'material-symbols:network-intelligence' },
  { key: 'markers', icon: 'material-symbols:neurology' },
  { key: 'kafka', icon: 'material-symbols:stream' },
  { key: 'ray', icon: 'material-symbols:lan' },
  { key: 'models', icon: 'material-symbols:deployed-code-history' },
  { key: 'access', icon: 'material-symbols:admin-panel-settings' },
]);
</script>

<template>
  <section
    id="capabilities"
    class="border-on-surface/8 bg-surface-container/35 border-y"
  >
    <div class="px-md py-xxx-huge lg:px-xx-lg container mx-auto">
      <div class="gap-md flex max-w-3xl flex-col">
        <h2 class="text-heading-x-lg tracking-sm text-on-surface font-semibold">
          {{ t('landing.capabilities.title') }}
        </h2>
        <p class="text-body-md text-on-surface-dim">
          {{ t('landing.capabilities.description') }}
        </p>
      </div>

      <div class="mt-xx-lg gap-lg grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <AppCard
          v-for="item in items"
          :key="item.key"
          border
          shadow="sm"
          class="duration-short hover:border-accent/40 h-full transition-all ease-out"
        >
          <div class="gap-md flex h-full flex-col">
            <div class="h-x-huge w-x-huge bg-info/12 text-info inline-flex items-center justify-center rounded-sm">
              <Icon
                :name="item.icon"
                size="2rem"
                aria-hidden="true"
              />
            </div>
            <h3 class="text-heading-md text-on-surface font-semibold">
              {{ t(`landing.capabilities.items.${item.key}.title`) }}
            </h3>
            <p class="text-body-sm text-on-surface-dim">
              {{ t(`landing.capabilities.items.${item.key}.description`) }}
            </p>
          </div>
        </AppCard>
      </div>
    </div>
  </section>
</template>
