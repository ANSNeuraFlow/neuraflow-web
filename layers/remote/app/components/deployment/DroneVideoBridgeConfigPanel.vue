<script setup lang="ts">
import { useRuntimeConfig } from '#imports';
import { useApi } from '#layers/core/app/composables/useApi';

const { t } = useI18n();
const { public: publicConfig } = useRuntimeConfig();

const MAVLINK_BRIDGE_CALLBACK = 'http://localhost:8788/callback';
const CLIENT_ID = 'mavlink_bridge';

const isConnecting = ref(false);
const isReady = ref(false);
const error = ref<string | null>(null);

const emit = defineEmits<{
  'update:ready': [value: boolean];
}>();

const checkVideoActive = async () => {
  try {
    const { get } = useApi();
    const res = await get<{ playbackAvailable: boolean; streamKey: string | null }>('/video-stream/active');
    isReady.value = Boolean(res.streamKey);
    error.value = null;
  } catch (e) {
    isReady.value = false;
    error.value = e instanceof Error ? e.message : 'Failed to check video stream';
  }
};

watch(isReady, (val) => emit('update:ready', val), { immediate: true });

onMounted(() => {
  if (import.meta.client) {
    void checkVideoActive();
  }
});

const connectBridge = async () => {
  if (!import.meta.client) return;

  error.value = null;
  isConnecting.value = true;

  const state = crypto.randomUUID();

  try {
    const siteBase = String(publicConfig.siteBaseUrl || 'http://localhost:3000').replace(/\/$/, '');
    const params = new URLSearchParams({
      clientId: CLIENT_ID,
      redirectUri: MAVLINK_BRIDGE_CALLBACK,
      state,
    });

    window.open(`${siteBase}/bridge/auth/start?${params.toString()}`, '_blank', 'noopener,noreferrer');

    const deadline = Date.now() + 120_000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000));
      await checkVideoActive();
      if (isReady.value) break;
    }

    if (!isReady.value) {
      error.value = t('remote.videoBridgePanel.timeoutHint');
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('remote.videoBridgePanel.errorGeneric');
  } finally {
    isConnecting.value = false;
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
          name="material-symbols:videocam"
          size="2rem"
        />
      </div>
      <div>
        <h2 class="text-heading-sm text-on-surface font-display font-bold">
          {{ t('remote.videoBridgePanel.title') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-xx-sm">
          {{ t('remote.videoBridgePanel.subtitle') }}
        </p>
      </div>
    </div>

    <div class="gap-sm border-on-surface/[0.08] bg-on-surface/[0.03] p-sm flex flex-col rounded-lg border">
      <p class="text-body-sm text-on-surface-dim">
        {{ t('remote.videoBridgePanel.djiHint') }}
      </p>
      <ol class="text-body-sm text-on-surface-dim pl-md gap-xx-sm flex list-decimal flex-col">
        <li>{{ t('remote.videoBridgePanel.stepConnect') }}</li>
        <li>{{ t('remote.videoBridgePanel.stepMavlink') }}</li>
        <li>{{ t('remote.videoBridgePanel.stepDjiFly') }}</li>
      </ol>
    </div>

    <div class="gap-sm flex items-center">
      <div
        :class="[
          'flex h-[2.8rem] w-[2.8rem] shrink-0 items-center justify-center rounded-full',
          isReady ? 'bg-success/10 text-success' : 'bg-on-surface/[0.06] text-on-surface-dim',
        ]"
      >
        <Icon
          :name="isReady ? 'material-symbols:check-circle-outline' : 'material-symbols:hourglass-empty'"
          size="1.4rem"
        />
      </div>
      <p :class="['text-body-sm font-medium', isReady ? 'text-success' : 'text-on-surface-dim']">
        {{
          isReady
            ? t('remote.videoBridgePanel.ready')
            : isConnecting
              ? t('remote.videoBridgePanel.connecting')
              : t('remote.videoBridgePanel.notReady')
        }}
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

    <div class="border-on-surface/[0.06] pt-sm mt-auto flex shrink-0 justify-end border-t">
      <AppButton
        variant="inverse"
        :loading="isConnecting"
        :disabled="isConnecting"
        @click="connectBridge"
      >
        <Icon
          name="material-symbols:link"
          size="1.8rem"
          class="mr-xs"
          aria-hidden="true"
        />
        {{ t('remote.videoBridgePanel.connect') }}
      </AppButton>
    </div>
  </div>
</template>
