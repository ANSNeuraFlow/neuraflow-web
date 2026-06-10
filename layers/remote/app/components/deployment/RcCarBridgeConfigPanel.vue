<script setup lang="ts">
import { useRcCarBridge } from '../../composables/useRcCarBridge';

const { t } = useI18n();
const bridge = useRcCarBridge();

const emit = defineEmits<{
  'update:ready': [value: boolean];
}>();

watch(
  () => bridge.isConnected.value,
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
          name="lucide:car"
          size="2rem"
        />
      </div>
      <div>
        <h2 class="text-heading-sm text-on-surface font-display font-bold">
          {{ t('remote.rcCarBridgePanel.title') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-xx-sm">
          {{ t('remote.rcCarBridgePanel.subtitle') }}
        </p>
      </div>
    </div>

    <div class="border-on-surface/[0.06] pt-sm gap-md flex flex-col border-t">
      <div class="gap-sm flex items-center">
        <div
          v-if="bridge.isConnected.value"
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
        <p :class="['text-body-sm font-medium', bridge.isConnected.value ? 'text-success' : 'text-on-surface-dim']">
          {{
            bridge.isConnected.value
              ? t('remote.rcCarBridgePanel.connected')
              : t('remote.rcCarBridgePanel.statusDisconnected')
          }}
        </p>
      </div>

      <div class="gap-sm flex items-center">
        <div
          :class="[
            'flex h-[2.8rem] w-[2.8rem] shrink-0 items-center justify-center rounded-full',
            bridge.serialConnected.value ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
          ]"
        >
          <Icon
            :name="bridge.serialConnected.value ? 'material-symbols:usb' : 'material-symbols:usb-off'"
            size="1.4rem"
          />
        </div>
        <p :class="['text-body-sm font-medium', bridge.serialConnected.value ? 'text-success' : 'text-warning']">
          {{
            bridge.serialConnected.value
              ? t('remote.rcCarBridgePanel.serialConnected')
              : t('remote.rcCarBridgePanel.serialDisconnected')
          }}
        </p>
      </div>

      <p
        v-if="!bridge.serialConnected.value && bridge.isConnected.value"
        class="text-body-x-sm text-on-surface-dim/70"
      >
        {{ t('remote.rcCarBridgePanel.serialHint') }}
      </p>
    </div>
  </div>
</template>
