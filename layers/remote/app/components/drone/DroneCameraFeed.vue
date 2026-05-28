<script setup lang="ts">
import { useDroneVideo } from '../../composables/useDroneVideo';

const { t } = useI18n();
const video = useDroneVideo();

const liveLabel = computed(() => {
  if (video.isConnected.value) return 'LIVE';
  if (video.isLoading.value) return '…';
  return '—';
});

const badgeColor = computed(() => (video.isConnected.value ? 'success' : 'default'));
</script>

<template>
  <div class="glass-card overflow-hidden">
    <div class="border-on-surface/[0.08] px-md py-sm flex items-center justify-between border-b">
      <div class="gap-sm flex items-center">
        <Icon
          name="material-symbols:videocam-outline"
          size="1.8rem"
          class="text-on-surface-dim"
        />
        <span class="text-body-sm text-on-surface font-medium">
          {{ t('remote.droneControl.camera.label') }}
        </span>
      </div>
      <AppStatusBadge
        :color="badgeColor"
        :label="liveLabel"
      />
    </div>

    <DroneVideoPlayer />
  </div>
</template>
