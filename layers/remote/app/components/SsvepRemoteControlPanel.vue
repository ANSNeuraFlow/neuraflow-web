<script setup lang="ts">
import { useSsvepBridge } from '#layers/ssvep/app/composables/useSsvepBridge';
import { useSsvepDetection } from '#layers/ssvep/app/composables/useSsvepDetection';
import { loadStoredRefreshRate } from '#layers/ssvep/app/utils/refresh-rate.utils';

const refreshRate = ref(loadStoredRefreshRate() ?? 60);
const bridge = useSsvepBridge();
const { isConnected, frequencyScores, currentCommand, currentConfidence } = useSsvepDetection();
const { t } = useI18n();

const detecting = ref(false);

const toggleDetection = () => {
  if (detecting.value) {
    bridge.stopDetection();
    detecting.value = false;
  } else {
    bridge.sendConfig({ refreshRate: refreshRate.value });
    bridge.startDetection();
    detecting.value = true;
  }
};

onBeforeUnmount(() => {
  if (detecting.value) bridge.stopDetection();
});
</script>

<template>
  <div class="gap-md flex flex-col">
    <SsvepRefreshRateSelector v-model="refreshRate" />

    <div class="glass-card gap-sm p-md flex flex-wrap items-center justify-between">
      <AppStatusBadge
        :color="isConnected ? 'success' : 'warning'"
        :label="isConnected ? t('ssvep.session.connected') : t('ssvep.session.disconnected')"
      />
      <AppButton
        :variant="detecting ? 'destructive' : 'inverse'"
        size="sm"
        :disabled="!isConnected"
        @click="toggleDetection"
      >
        {{ detecting ? t('ssvep.session.stopDetection') : t('ssvep.session.startDetection') }}
      </AppButton>
    </div>

    <SsvepFrequencyDisplay
      :scores="frequencyScores"
      :refresh-rate="refreshRate"
      :active-command="currentCommand"
    />

    <p
      v-if="currentCommand"
      class="text-body-sm text-on-surface text-center"
    >
      {{ t('ssvep.detection.confidence', { command: currentCommand, pct: Math.round(currentConfidence * 100) }) }}
    </p>
  </div>
</template>
