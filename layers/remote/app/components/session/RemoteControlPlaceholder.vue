<script setup lang="ts">
import { loadStoredRefreshRate } from '#layers/ssvep/app/utils/refresh-rate.utils';

defineProps<{
  vehicleType: 'drone' | 'car';
}>();

const emit = defineEmits<{
  endSession: [];
}>();

const { t } = useI18n();
const bciMode = ref<'manual' | 'ssvep'>('manual');
const refreshRate = ref(loadStoredRefreshRate() ?? 60);
</script>

<template>
  <div class="gap-x-lg flex flex-col">
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
            :label="$t('remote.control.sessionActive')"
          />
        </div>

        <p class="text-body-md text-on-surface font-semibold leading-tight">
          {{ $t(`remote.control.vehicle.${vehicleType}`) }}
        </p>
      </div>

      <AppButton
        class="shrink-0"
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

    <div class="glass-card gap-sm p-md flex flex-wrap">
      <AppButton
        :variant="bciMode === 'manual' ? 'inverse' : 'secondary'"
        size="sm"
        @click="bciMode = 'manual'"
      >
        {{ t('remote.ssvep.modeManual') }}
      </AppButton>
      <AppButton
        :variant="bciMode === 'ssvep' ? 'inverse' : 'secondary'"
        size="sm"
        @click="bciMode = 'ssvep'"
      >
        {{ t('remote.ssvep.modeSsvep') }}
      </AppButton>
    </div>

    <div
      v-if="bciMode === 'ssvep'"
      class="gap-x-lg lg:grid lg:grid-cols-[1fr_22rem]"
    >
      <div class="glass-card relative min-h-[36rem] overflow-hidden">
        <SsvepStimuli
          :refresh-rate="refreshRate"
          fullscreen
        />
      </div>
      <SsvepRemoteControlPanel />
    </div>

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
