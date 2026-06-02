<script setup lang="ts">
import { useSsvepBridge } from '../composables/useSsvepBridge';
import { useSsvepDetection } from '../composables/useSsvepDetection';

const props = defineProps<{
  refreshRate: number;
  frequencies?: number[];
}>();

const bridge = useSsvepBridge();
const { isConnected, connectionError, currentCommand, currentConfidence } = useSsvepDetection();
const { t } = useI18n();

const configured = ref(false);

const startSession = () => {
  bridge.sendConfig({
    frequencies: props.frequencies,
    refreshRate: props.refreshRate,
  });
  bridge.startDetection();
  configured.value = true;
};

const stopSession = () => {
  bridge.stopDetection();
  configured.value = false;
};

onBeforeUnmount(() => {
  if (configured.value) bridge.stopDetection();
});
</script>

<template>
  <div class="glass-card gap-md p-md sm:p-x-lg flex flex-col">
    <div class="gap-sm flex flex-wrap items-center justify-between">
      <h3 class="text-heading-sm text-on-surface font-display font-bold">
        {{ t('ssvep.session.panelTitle') }}
      </h3>
      <AppStatusBadge
        :color="isConnected ? 'success' : 'warning'"
        :label="isConnected ? t('ssvep.session.connected') : t('ssvep.session.disconnected')"
      />
    </div>

    <p
      v-if="connectionError"
      class="text-body-sm text-error"
    >
      {{ connectionError }}
    </p>

    <div class="gap-sm flex flex-wrap">
      <AppButton
        v-if="!configured"
        variant="inverse"
        size="md"
        :disabled="!isConnected"
        @click="startSession"
      >
        {{ t('ssvep.session.startDetection') }}
      </AppButton>
      <AppButton
        v-else
        variant="destructive"
        size="md"
        @click="stopSession"
      >
        {{ t('ssvep.session.stopDetection') }}
      </AppButton>
    </div>

    <p
      v-if="currentCommand"
      class="text-body-sm text-on-surface"
    >
      {{ t('ssvep.detection.confidence', { command: currentCommand, pct: Math.round(currentConfidence * 100) }) }}
    </p>
  </div>
</template>
