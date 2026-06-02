<script setup lang="ts">
import { useSsvepCalibration } from '../composables/useSsvepCalibration';

const {
  refreshRate,
  phase,
  currentTrial,
  totalTrials,
  activeDirection,
  containerRef,
  toggleFullscreen,
  runCalibration,
  abort,
} = useSsvepCalibration();
const { t } = useI18n();

const started = ref(false);

const begin = async () => {
  started.value = true;
  await toggleFullscreen();
  await runCalibration();
};
</script>

<template>
  <div
    ref="containerRef"
    class="gap-x-lg flex flex-col"
  >
    <SsvepRefreshRateSelector v-model="refreshRate" />

    <div
      v-if="phase === 'setup' || phase === 'intro'"
      class="glass-card gap-md p-md sm:p-x-lg"
    >
      <p class="text-body-md text-on-surface-dim">
        {{ t('ssvep.calibration.intro') }}
      </p>
      <AppButton
        variant="inverse"
        :disabled="started"
        @click="begin"
      >
        {{ t('ssvep.calibration.start') }}
      </AppButton>
    </div>

    <div
      v-else-if="phase !== 'done'"
      class="relative min-h-[32rem]"
    >
      <SsvepStimuli
        :refresh-rate="refreshRate"
        :cued-direction="activeDirection"
        fullscreen
      />
      <div class="glass-card p-sm absolute left-4 top-4 z-10">
        <p class="text-body-sm text-on-surface font-semibold">
          {{ t('ssvep.calibration.trial', { current: currentTrial, total: totalTrials }) }}
        </p>
        <p class="text-body-x-sm text-on-surface-dim capitalize">{{ phase }}</p>
      </div>
      <AppButton
        class="absolute right-4 top-4 z-10"
        variant="destructive"
        size="sm"
        @click="abort"
      >
        {{ t('ssvep.calibration.abort') }}
      </AppButton>
    </div>

    <div
      v-else
      class="glass-card p-md text-center"
    >
      <p class="text-body-md text-success font-semibold">
        {{ t('ssvep.calibration.done') }}
      </p>
    </div>
  </div>
</template>
