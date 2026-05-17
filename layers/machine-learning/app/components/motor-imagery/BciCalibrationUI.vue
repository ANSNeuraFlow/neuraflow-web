<script setup lang="ts">
import { useBciCalibration } from '../../composables/useBciCalibration';
import type { EegIngressMode } from '../../models/eeg-ingress.domain';

const emit = defineEmits<{
  finished: [];
  aborted: [];
}>();

const {
  currentState,
  currentTrial,
  totalTrialsRef,
  activeCue,
  containerRef,
  runProtocol,
  runTutorial,
  abortProtocol,
  protocolEndReason,
  tutorialMode,
  showCross,
  showCue,
  showBlank,
} = useBciCalibration();

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

defineExpose({ runProtocol });

interface BciSessionStartPayload {
  name: string;
  classes: string[];
  trialsPerDirection: number;
  ingressMode: EegIngressMode;
}

const onSessionStart = async (payload: BciSessionStartPayload) => {
  await runProtocol(payload.name, payload.classes, payload.trialsPerDirection, payload.ingressMode);
};

const onTutorialStart = async () => {
  showTutorialDialog.value = false;
  await runTutorial();
};
</script>

<template>
  <BciSessionDialog
    v-model:open="showSessionDialog"
    @start="onSessionStart"
  />

  <BciTutorialDialog
    v-model:open="showTutorialDialog"
    @start="onTutorialStart"
  />

  <main
    ref="containerRef"
    class="duration-medium relative flex flex-col items-center justify-center overflow-hidden rounded-2xl transition-colors"
    :class="[
      currentState !== 'idle'
        ? 'fixed inset-0 z-[9999] bg-black'
        : 'border-on-surface/[0.08] bg-on-surface/[0.03] min-h-[32rem] border backdrop-blur-sm',
    ]"
  >
    <BciIdlePanel
      v-if="currentState === 'idle'"
      @open-session="showSessionDialog = true"
      @open-tutorial="showTutorialDialog = true"
    />

    <BciSessionRunner
      v-else
      :current-state="currentState"
      :current-trial="currentTrial"
      :total-trials="totalTrialsRef"
      :active-cue="activeCue"
      :show-cross="showCross"
      :show-cue="showCue"
      :show-blank="showBlank"
      :tutorial-mode="tutorialMode"
      @abort="abortProtocol"
    />
  </main>
</template>

<style scoped>
main {
  user-select: none;
  -webkit-user-select: none;
}
</style>
