<script setup lang="ts">
const { t } = useI18n();
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
        color="default"
        label="— fps"
      />
    </div>

    <div class="relative aspect-video w-full bg-black/90">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.035]"
        style="
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgb(255 255 255 / 60%) 2px,
            rgb(255 255 255 / 60%) 3px
          );
        "
        aria-hidden="true"
      />
      <div class="gap-md absolute inset-0 flex flex-col items-center justify-center">
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
            {{ t('remote.droneControl.camera.noSignal') }}
          </p>
          <p class="text-body-x-sm text-on-surface-dim/35 mt-xx-sm">
            {{ t('remote.droneControl.camera.noSignalHint') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
