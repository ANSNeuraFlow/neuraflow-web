<script setup lang="ts">
import { useAttentionCalibration } from '../../composables/useAttentionCalibration';
import type { EegIngressMode } from '../../models/eeg-ingress.domain';

const emit = defineEmits<{
  finished: [];
  aborted: [];
  trainModel: [];
}>();

const {
  currentState,
  currentTrial,
  totalTrialsRef,
  activeCue,
  containerRef,
  protocolEndReason,
  tutorialMode,
  soundEnabled,
  baselineSecondsLeft,
  cptDigit,
  collectedTrials,
  sessionDurationMs,
  runProtocol,
  runTutorial,
  abortProtocol,
  resetSession,
  continueAfterBreak,
  showCue,
  showTask,
  showRest,
  showBreak,
  showBaseline,
  showSummary,
} = useAttentionCalibration();

const showSessionDialog = ref(false);
const showTutorialDialog = ref(false);

watch(protocolEndReason, (reason) => {
  if (reason === 'success') {
    emit('finished');
    protocolEndReason.value = null;
  } else if (reason === 'abort') {
    emit('aborted');
    protocolEndReason.value = null;
  } else if (reason === 'tutorial-done') {
    protocolEndReason.value = null;
  }
});

const onSessionStart = async (payload: { name: string; ingressMode: EegIngressMode }) => {
  await runProtocol(payload.name, payload.ingressMode);
};

const onTutorialStart = async () => {
  showTutorialDialog.value = false;
  await runTutorial();
};

const onTrainModel = () => {
  resetSession();
  emit('trainModel');
};

const isOverlay = computed(
  () => currentState.value !== 'idle' && currentState.value !== 'break' && currentState.value !== 'summary',
);
</script>

<template>
  <AttentionSessionDialog
    v-model:open="showSessionDialog"
    @start="onSessionStart"
  />

  <AttentionTutorialDialog
    v-model:open="showTutorialDialog"
    @start="onTutorialStart"
  />

  <main
    ref="containerRef"
    class="duration-medium relative flex flex-col items-center justify-center overflow-hidden rounded-2xl transition-colors"
    :class="[
      isOverlay
        ? 'fixed inset-0 z-[9999] bg-black'
        : 'border-on-surface/[0.08] bg-on-surface/[0.03] min-h-[32rem] border backdrop-blur-sm',
    ]"
  >
    <AttentionIdlePanel
      v-if="currentState === 'idle'"
      @open-session="showSessionDialog = true"
      @open-tutorial="showTutorialDialog = true"
    />

    <AttentionSessionRunner
      v-else
      :current-state="currentState"
      :current-trial="currentTrial"
      :total-trials="totalTrialsRef"
      :active-cue="activeCue"
      :show-cue="showCue"
      :show-task="showTask"
      :show-rest="showRest"
      :show-break="showBreak"
      :show-baseline="showBaseline"
      :show-summary="showSummary"
      :tutorial-mode="tutorialMode"
      :baseline-seconds-left="baselineSecondsLeft"
      :cpt-digit="cptDigit"
      :collected-trials="collectedTrials"
      :session-duration-ms="sessionDurationMs"
      :sound-enabled="soundEnabled"
      @abort="abortProtocol"
      @continue-break="continueAfterBreak"
      @train-model="onTrainModel"
      @toggle-sound="soundEnabled = !soundEnabled"
    />
  </main>
</template>

<style scoped>
main {
  user-select: none;
  -webkit-user-select: none;
}
</style>
