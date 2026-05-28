<script setup lang="ts">
import { useDroneVideo } from '../../composables/useDroneVideo';

const { t } = useI18n();

const video = useDroneVideo();
const videoEl = ref<HTMLVideoElement | null>(null);

watch(
  () => video.videoStream.value,
  (stream) => {
    if (videoEl.value) {
      videoEl.value.srcObject = stream;
      if (stream) {
        void videoEl.value.play().catch(() => undefined);
      }
    }
  },
);
</script>

<template>
  <div class="relative aspect-video w-full bg-black/90">
    <video
      ref="videoEl"
      class="h-full w-full object-contain"
      autoplay
      playsinline
      muted
    />

    <div
      v-if="video.isLoading.value"
      class="absolute inset-0 flex items-center justify-center bg-black/50"
    >
      <Icon
        name="material-symbols:progress-activity"
        size="3.2rem"
        class="text-on-surface-dim animate-spin"
      />
    </div>

    <div
      v-else-if="video.error.value"
      class="gap-sm px-md absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center"
    >
      <Icon
        name="material-symbols:error-outline"
        size="3rem"
        class="text-warning"
      />
      <p class="text-body-sm text-on-surface-dim">{{ video.error.value }}</p>
      <AppButton
        variant="secondary"
        size="sm"
        @click="video.connect()"
      >
        {{ t('remote.droneControl.camera.reconnect') }}
      </AppButton>
    </div>

    <div
      v-else-if="!video.isConnected.value"
      class="gap-md absolute inset-0 flex flex-col items-center justify-center"
    >
      <div
        class="border-on-surface/[0.08] bg-on-surface/[0.04] flex h-[7.2rem] w-[7.2rem] items-center justify-center rounded-2xl border"
      >
        <Icon
          name="material-symbols:videocam-off-outline"
          size="3.6rem"
          class="text-on-surface-dim/30"
        />
      </div>
      <div class="text-center">
        <p class="text-body-md text-on-surface-dim/60 font-medium">
          {{
            video.isWaitingForStream.value
              ? t('remote.droneControl.camera.waitingForStream')
              : t('remote.droneControl.camera.noSignal')
          }}
        </p>
        <p class="text-body-x-sm text-on-surface-dim/35 mt-xx-sm">
          {{ t('remote.droneControl.camera.noSignalHint') }}
        </p>
      </div>
    </div>
  </div>
</template>
