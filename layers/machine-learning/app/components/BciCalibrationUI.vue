<script setup lang="ts">
import { useBciCalibration } from '../composables/useBciCalibration';

const {
  config,
  currentState,
  currentTrial,
  activeCue,
  containerRef,
  runProtocol,
  abortProtocol,
  resetSession,
  showCross,
  showCue,
  showBlank,
} = useBciCalibration();

const getCueIcon = (cue: string) => {
  const map: Record<string, string> = {
    LEFT: 'material-symbols:arrow-left-alt-rounded',
    RIGHT: 'material-symbols:arrow-right-alt-rounded',
    UP: 'material-symbols:arrow-upward-alt-rounded',
    DOWN: 'material-symbols:arrow-downward-alt-rounded',
  };
  return map[cue] || 'material-symbols:help-outline-rounded';
};
</script>

<template>
  <main
    ref="containerRef"
    class="duration-medium relative flex flex-col items-center justify-center overflow-hidden rounded-2xl transition-colors"
    :class="[
      currentState !== 'idle' && currentState !== 'finished'
        ? 'fixed inset-0 z-[9999] bg-black'
        : 'bg-surface-container border-outline min-h-[70vh] border',
    ]"
  >
    <div
      v-if="currentState === 'idle'"
      class="gap-lg z-10 flex flex-col items-center text-center"
    >
      <Icon
        name="material-symbols:psychology-rounded"
        size="8rem"
        class="text-accent opacity-80"
      />
      <div class="px-md max-w-2xl">
        <h2 class="text-heading-md text-on-surface mb-sm font-semibold">Ready for Calibration</h2>
        <p class="text-body-md text-on-surface-dim mb-lg">
          Ensure your EEG cap is fitted securely and impedance levels are optimal. The protocol consists of
          {{ config.totalTrials }} balanced trials focusing on {{ config.classes.join(' and ') }} motor imagery
          sequences.
        </p>
      </div>
      <AppButton
        size="lg"
        class="shadow-accent/20 w-full shadow-xl sm:w-auto"
        @click="runProtocol"
      >
        <Icon
          name="material-symbols:play-arrow-rounded"
          size="2.4rem"
          class="mr-sm"
        />
        Start Session (Fullscreen)
      </AppButton>
    </div>

    <div
      v-else-if="!showBlank && currentState !== 'finished'"
      class="relative flex h-full w-full items-center justify-center"
    >
      <div
        v-show="showCross"
        class="pointer-events-none absolute z-10 select-none text-[12rem] font-light leading-none tracking-tighter text-white md:text-[18rem]"
      >
        +
      </div>

      <div
        v-show="showCue"
        class="pointer-events-none absolute z-20 flex select-none items-center justify-center"
        :class="{
          '-translate-x-[80%] md:-translate-x-[90%]': activeCue === 'LEFT',
          'translate-x-[80%] md:translate-x-[90%]': activeCue === 'RIGHT',
          '-translate-y-[80%] md:-translate-y-[90%]': activeCue === 'UP',
          'translate-y-[80%] md:translate-y-[90%]': activeCue === 'DOWN',
        }"
      >
        <Icon
          :name="getCueIcon(activeCue)"
          class="h-[12rem] w-[12rem] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] md:h-[22rem] md:w-[22rem]"
        />
      </div>
    </div>

    <div
      v-if="currentState === 'finished'"
      class="gap-lg z-10 flex flex-col items-center text-center"
    >
      <Icon
        name="material-symbols:check-circle-outline-rounded"
        size="8rem"
        class="text-success opacity-80"
      />
      <h2 class="text-heading-md text-on-surface font-semibold">Calibration Complete</h2>
      <p class="text-body-md text-on-surface-dim max-w-xl">
        The motor imagery training loop has successfully finished. Event markers have been transmitted to the EEG proxy
        block.
      </p>
      <AppButton
        variant="secondary"
        size="lg"
        @click="resetSession"
      >
        Reset Session
      </AppButton>
    </div>

    <div
      v-if="currentState !== 'idle' && currentState !== 'finished'"
      class="bottom-md left-md right-md absolute flex items-end justify-between opacity-20 transition-opacity hover:opacity-100"
    >
      <div class="text-body-sm space-y-tiny p-sm rounded-lg bg-black/50 font-mono text-white backdrop-blur-md">
        <p>TRIAL: {{ currentTrial }} / {{ config.totalTrials }}</p>
        <p>
          STATE: <span class="text-accent font-bold uppercase">{{ currentState }}</span>
        </p>
        <p v-if="activeCue">CLASS: {{ activeCue }}</p>
      </div>
      <AppButton
        variant="ghost"
        class="hover:text-error hover:bg-error/20 text-white"
        @click="abortProtocol"
      >
        Abort
      </AppButton>
    </div>
  </main>
</template>

<style scoped>
main {
  user-select: none;
  -webkit-user-select: none;
}
</style>
