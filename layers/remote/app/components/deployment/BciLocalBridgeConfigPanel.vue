<script setup lang="ts">
const { t } = useI18n();

const isConnected = useState<boolean>('bci-bridge-connected', () => false);

const emit = defineEmits<{
  'update:ready': [value: boolean];
}>();

watch(
  isConnected,
  (connected) => {
    emit('update:ready', connected);
  },
  { immediate: true },
);
</script>

<template>
  <div class="glass-card p-x-lg gap-x-lg flex h-full flex-col">
    <div class="gap-md flex items-center">
      <div
        class="bg-on-surface/10 text-on-surface flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-full"
      >
        <Icon
          name="lucide:cpu"
          size="2rem"
        />
      </div>
      <div>
        <h2 class="text-heading-sm text-on-surface font-display font-bold">
          {{ t('remote.localBridgePanel.title') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-xx-sm">
          {{ t('remote.localBridgePanel.subtitle') }}
        </p>
      </div>
    </div>

    <div class="border-on-surface/[0.06] pt-sm gap-md flex flex-col border-t">
      <div class="gap-sm flex items-center">
        <div
          v-if="isConnected"
          class="relative flex h-[2.8rem] w-[2.8rem] shrink-0 items-center justify-center"
        >
          <span class="bg-success/25 absolute inset-0 animate-ping rounded-full" />
          <div class="bg-success/10 text-success relative flex h-full w-full items-center justify-center rounded-full">
            <Icon
              name="material-symbols:link"
              size="1.4rem"
            />
          </div>
        </div>
        <div
          v-else
          class="bg-on-surface/[0.06] text-on-surface-dim flex h-[2.8rem] w-[2.8rem] shrink-0 items-center justify-center rounded-full"
        >
          <Icon
            name="material-symbols:link-off"
            size="1.4rem"
          />
        </div>
        <p :class="['text-body-sm font-medium', isConnected ? 'text-success' : 'text-on-surface-dim']">
          {{ isConnected ? t('remote.localBridgePanel.connected') : t('remote.localBridgePanel.statusDisconnected') }}
        </p>
      </div>
    </div>
  </div>
</template>
