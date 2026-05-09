<script setup lang="ts">
defineEmits<{
  endSession: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="glass-card gap-md border-success/20 p-md sm:p-x-lg flex flex-wrap items-center justify-between border">
    <div class="gap-xx-sm flex min-w-0 flex-col items-start">
      <div class="gap-sm flex items-center">
        <div class="relative flex h-[4rem] w-[4rem] shrink-0 items-center justify-center">
          <span class="bg-success/25 absolute inset-0 animate-ping rounded-full" />
          <div class="bg-success/10 relative flex size-full items-center justify-center rounded-full">
            <Icon
              name="material-symbols:wifi"
              size="2rem"
              class="text-success"
            />
          </div>
        </div>

        <AppStatusBadge
          class="shrink-0"
          color="success"
          :label="t('remote.control.sessionActive')"
        />
      </div>

      <p class="text-body-md text-on-surface font-semibold leading-tight">
        {{ t('remote.control.vehicle.drone') }}
      </p>
    </div>

    <AppButton
      class="shrink-0"
      variant="destructive"
      size="sm"
      @click="$emit('endSession')"
    >
      <Icon
        name="material-symbols:stop-circle-outline"
        size="1.8rem"
      />
      {{ t('remote.control.endSession') }}
    </AppButton>
  </div>
</template>
