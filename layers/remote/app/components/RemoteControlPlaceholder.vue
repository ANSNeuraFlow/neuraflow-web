<script setup lang="ts">
defineProps<{
  vehicleType: 'drone' | 'car' | 'game';
}>();

const emit = defineEmits<{
  endSession: [];
}>();
</script>

<template>
  <div class="gap-x-lg flex flex-col">
    <div
      v-if="vehicleType !== 'game'"
      class="glass-card p-md sm:p-x-lg border-success/20 gap-md flex flex-wrap items-center justify-between border"
    >
      <div class="gap-md flex items-center">
        <div class="relative flex h-[4rem] w-[4rem] shrink-0 items-center justify-center">
          <span class="bg-success/25 absolute inset-0 animate-ping rounded-full" />
          <div class="bg-success/10 relative flex h-full w-full items-center justify-center rounded-full">
            <Icon
              name="material-symbols:wifi"
              size="2rem"
              class="text-success"
            />
          </div>
        </div>

        <div>
          <div class="gap-xs mb-xx-sm flex items-center">
            <span class="bg-success/20 text-success px-xs py-x-tiny text-body-x-sm rounded-full font-semibold">
              {{ $t('remote.control.sessionActive') }}
            </span>
          </div>
          <p class="text-body-md text-on-surface font-semibold">
            {{ $t(`remote.control.vehicle.${vehicleType}`) }}
          </p>
        </div>
      </div>

      <AppButton
        variant="destructive"
        size="sm"
        @click="emit('endSession')"
      >
        <Icon
          name="material-symbols:stop-circle-outline"
          size="1.8rem"
          class="mr-xs"
        />
        {{ $t('remote.control.endSession') }}
      </AppButton>
    </div>

    <template v-if="vehicleType === 'game'">
      <BCIDinoGame @close="emit('endSession')" />
    </template>
    <div
      v-else
      class="glass-card p-xx-lg flex min-h-[44rem] flex-col items-center justify-center text-center"
    >
      <h2 class="text-heading-sm text-on-surface mb-sm font-display font-bold">
        {{ $t('remote.control.placeholder.title') }}
      </h2>
      <p class="text-body-md text-on-surface-dim max-w-[44rem]">
        {{ $t('remote.control.placeholder.body') }}
      </p>
    </div>
  </div>
</template>
