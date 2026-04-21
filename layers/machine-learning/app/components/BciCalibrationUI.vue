<script setup lang="ts">
import { useBciCalibration } from '../composables/useBciCalibration';

const emit = defineEmits<{
  finished: [];
  aborted: [];
}>();

const {
  config,
  currentState,
  currentTrial,
  activeCue,
  containerRef,
  runProtocol,
  abortProtocol,
  protocolEndReason,
  showCross,
  showCue,
  showBlank,
} = useBciCalibration();

const showNamingDialog = ref(false);
const sessionNameInput = ref('');
const sessionNameError = ref('');

const openNamingDialog = () => {
  sessionNameInput.value = '';
  sessionNameError.value = '';
  showNamingDialog.value = true;
};

const startSession = async () => {
  const name = sessionNameInput.value.trim();
  if (!name) {
    sessionNameError.value = 'Wprowadź nazwę sesji';
    return;
  }
  showNamingDialog.value = false;
  await runProtocol(name);
};

watch(protocolEndReason, (reason) => {
  if (reason === 'success') {
    emit('finished');
    protocolEndReason.value = null;
  } else if (reason === 'abort') {
    emit('aborted');
    protocolEndReason.value = null;
  }
});

defineExpose({ runProtocol });

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
  <DialogRoot
    :open="showNamingDialog"
    @update:open="showNamingDialog = $event"
  >
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <DialogContent
        class="bg-surface/80 dark:bg-surface/30 !border-on-surface/10 fixed left-1/2 top-1/2 z-50 w-full max-w-[48rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-[0_0_80px_rgba(0,0,0,0.4)] outline-none backdrop-blur-3xl"
        @open-auto-focus.prevent
      >
        <div
          class="bg-info/5 dark:bg-info/10 pointer-events-none absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          class="bg-accent/5 dark:bg-accent/10 pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          class="noise-overlay"
          aria-hidden="true"
        />
        <div class="p-x-lg sm:p-xx-lg relative z-10">
          <div class="mb-x-lg gap-md flex items-start justify-between">
            <div>
              <p class="mb-xx-sm text-body-x-sm text-on-surface-dim font-semibold uppercase tracking-wider">Moduł ML</p>
              <DialogTitle class="text-heading-md tracking-sm text-on-surface font-display font-bold">
                Nowa sesja EEG
              </DialogTitle>
            </div>
            <DialogClose as-child>
              <button
                class="mt-xx-sm p-xx-sm text-on-surface-dim duration-short hover:bg-on-surface/[0.06] hover:text-on-surface rounded-lg transition-colors"
                aria-label="Zamknij"
              >
                <Icon
                  name="material-symbols:close"
                  size="2rem"
                />
              </button>
            </DialogClose>
          </div>

          <div class="gap-x-lg flex flex-col">
            <AppFormField
              label="Nazwa sesji"
              :error="sessionNameError || undefined"
              html-for="session-name-bci-input"
              required
            >
              <AppInput
                id="session-name-bci-input"
                v-model="sessionNameInput"
                placeholder="np. Trening lewo/prawo — 40 prób"
                :error="!!sessionNameError"
                @keydown.enter="startSession"
              />
            </AppFormField>

            <p class="text-body-sm text-on-surface-dim">
              Sesja zostanie zarejestrowana w systemie. Po potwierdzeniu uruchomi się protokół Motor Imagery w trybie
              pełnoekranowym.
            </p>

            <div class="gap-md border-on-surface/10 pt-x-lg flex justify-end border-t">
              <DialogClose as-child>
                <AppButton variant="secondary"> Anuluj </AppButton>
              </DialogClose>
              <AppButton
                variant="inverse"
                @click="startSession"
              >
                <Icon
                  name="material-symbols:play-arrow-rounded"
                  size="1.8rem"
                />
                Rozpocznij sesję
              </AppButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>

  <main
    ref="containerRef"
    class="duration-medium relative flex flex-col items-center justify-center overflow-hidden rounded-2xl transition-colors"
    :class="[
      currentState !== 'idle'
        ? 'fixed inset-0 z-[9999] bg-black'
        : 'bg-surface-container border-outline min-h-[70vh] border',
    ]"
  >
    <div
      v-if="currentState === 'idle'"
      class="gap-lg z-10 flex flex-col items-center text-center"
    >
      <Icon
        name="material-symbols:neurology-rounded"
        size="8rem"
        class="text-accent opacity-80"
      />
      <div class="px-md max-w-2xl">
        <h2 class="text-heading-md text-on-surface mb-sm font-semibold">Gotowy do rejestracji</h2>
        <p class="text-body-md text-on-surface-dim mb-lg">
          Upewnij się, że czepek EEG jest poprawnie założony, a impedancje elektrod są optymalne. Protokół składa się z
          {{ config.totalTrials }} zrównoważonych prób opartych na wyobraźni ruchowej ({{ config.classes.join(', ') }}).
        </p>
      </div>
      <AppButton
        variant="inverse"
        size="lg"
        class="w-full sm:w-auto"
        @click="openNamingDialog"
      >
        <Icon
          name="material-symbols:play-arrow-rounded"
          size="2.4rem"
          class="mr-sm"
        />
        Rozpocznij sesję
      </AppButton>
    </div>

    <div
      v-else-if="!showBlank"
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
      v-if="currentState !== 'idle'"
      class="bottom-md left-md right-md absolute flex items-end justify-between opacity-20 transition-opacity hover:opacity-100"
    >
      <div class="text-body-sm space-y-tiny p-sm rounded-lg bg-black/50 font-mono text-white backdrop-blur-md">
        <p>PRÓBA: {{ currentTrial }} / {{ config.totalTrials }}</p>
        <p>
          STAN: <span class="text-accent font-bold uppercase">{{ currentState }}</span>
        </p>
        <p v-if="activeCue">KLASA: {{ activeCue }}</p>
      </div>
      <AppButton
        variant="ghost"
        class="hover:text-error hover:bg-error/20 text-white"
        @click="abortProtocol"
      >
        Przerwij
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
