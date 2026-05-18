<script setup lang="ts">
import { useBridgeConnection } from '#layers/bridge-auth/app/composables/useBridgeConnection';

const { t } = useI18n();

const { isConnected, isStreaming, isConnecting, isStartingStream, error, connect, startStreaming } =
  useBridgeConnection();

const emit = defineEmits<{
  'update:ready': [value: boolean];
}>();

const isReady = computed(() => isConnected.value && isStreaming.value);

watch(isReady, (val) => emit('update:ready', val), { immediate: true });

const primaryLabel = computed(() =>
  !isConnected.value ? t('remote.mainBridgePanel.launchBridge') : t('remote.mainBridgePanel.startStreaming'),
);

const primaryLoading = computed(() => (!isConnected.value ? isConnecting.value : isStartingStream.value));

const primaryDisabled = computed(() => (!isConnected.value ? isConnecting.value : isStartingStream.value));

const onPrimaryAction = () => {
  if (!isConnected.value) {
    void connect();
    return;
  }
  if (!isStreaming.value) {
    void startStreaming();
  }
};
</script>

<template>
  <div class="glass-card p-x-lg gap-x-lg flex h-full flex-col lg:min-h-0">
    <div class="gap-md flex shrink-0 items-center">
      <div
        class="bg-on-surface/10 text-on-surface flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-full"
      >
        <Icon
          name="lucide:radio"
          size="2rem"
        />
      </div>
      <div>
        <h2 class="text-heading-sm text-on-surface font-display font-bold">
          {{ t('remote.mainBridgePanel.title') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-xx-sm">
          {{ t('remote.mainBridgePanel.subtitle') }}
        </p>
      </div>
    </div>

    <div class="gap-md mt-sm flex min-h-0 flex-1 flex-col">
      <div class="gap-sm flex flex-col">
        <div class="gap-sm flex items-center">
          <div
            v-if="isConnected"
            class="relative flex h-[2.8rem] w-[2.8rem] shrink-0 items-center justify-center"
          >
            <span class="bg-success/25 absolute inset-0 animate-ping rounded-full" />
            <div
              class="bg-success/10 text-success relative flex h-full w-full items-center justify-center rounded-full"
            >
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
            {{ isConnected ? t('remote.mainBridgePanel.connected') : t('remote.mainBridgePanel.statusDisconnected') }}
          </p>
        </div>

        <div
          v-if="error"
          class="border-warning/25 bg-warning/[0.06] gap-xs p-sm flex items-start rounded-sm border"
          role="alert"
        >
          <Icon
            name="material-symbols:warning-outline"
            size="1.6rem"
            class="text-warning mt-px shrink-0"
          />
          <span class="text-body-sm text-on-surface-dim">{{ error }}</span>
        </div>
      </div>

      <div
        :class="[
          'flex flex-col transition-opacity duration-200',
          isConnected ? 'opacity-100' : 'pointer-events-none opacity-30',
        ]"
        :aria-disabled="!isConnected"
      >
        <div class="gap-sm flex items-center">
          <div
            v-if="isStreaming"
            class="relative flex h-[2.8rem] w-[2.8rem] shrink-0 items-center justify-center"
          >
            <span class="bg-success/25 absolute inset-0 animate-ping rounded-full" />
            <div
              class="bg-success/10 text-success relative flex h-full w-full items-center justify-center rounded-full"
            >
              <Icon
                name="material-symbols:sensors"
                size="1.4rem"
              />
            </div>
          </div>
          <div
            v-else
            class="bg-on-surface/[0.06] text-on-surface-dim flex h-[2.8rem] w-[2.8rem] shrink-0 items-center justify-center rounded-full"
          >
            <Icon
              name="material-symbols:sensors-off"
              size="1.4rem"
            />
          </div>
          <p :class="['text-body-sm font-medium', isStreaming ? 'text-success' : 'text-on-surface-dim']">
            {{ isStreaming ? t('remote.mainBridgePanel.streaming') : t('remote.mainBridgePanel.streamingIdle') }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="!isStreaming"
      class="border-on-surface/[0.06] pt-sm mt-auto flex min-h-[3.6rem] shrink-0 items-center justify-end border-t"
    >
      <AppButton
        variant="inverse"
        :loading="primaryLoading"
        :disabled="primaryDisabled"
        @click="onPrimaryAction"
      >
        <Icon
          name="lucide:rocket"
          size="1.8rem"
          class="mr-xs"
          aria-hidden="true"
        />
        {{ primaryLabel }}
      </AppButton>
    </div>
  </div>
</template>
