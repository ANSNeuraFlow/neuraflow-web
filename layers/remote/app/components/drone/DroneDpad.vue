<script setup lang="ts">
import type { DroneDirection } from '../../models/drone-control.domain';

const props = defineProps<{
  disabled: boolean;
}>();

const emit = defineEmits<{
  move: [direction: DroneDirection];
}>();

const { t } = useI18n();

const pressedDir = ref<DroneDirection | null>(null);

const keyMap: Record<string, DroneDirection> = {
  ArrowUp: 'forward',
  w: 'forward',
  W: 'forward',
  ArrowDown: 'backward',
  s: 'backward',
  S: 'backward',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
};

const handleKeydown = (e: KeyboardEvent) => {
  const dir = keyMap[e.key];
  if (!dir) return;
  e.preventDefault();
  if (!e.repeat) {
    pressedDir.value = dir;
    if (!props.disabled) emit('move', dir);
  }
};

const handleKeyup = (e: KeyboardEvent) => {
  const dir = keyMap[e.key];
  if (dir && pressedDir.value === dir) {
    pressedDir.value = null;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('keyup', handleKeyup);
});

const arrowBtnClass = (dir: DroneDirection) =>
  [
    'flex h-[5.6rem] w-[5.6rem] items-center justify-center rounded-xl border transition-all duration-100 select-none',
    props.disabled
      ? 'cursor-not-allowed border-on-surface/[0.06] bg-on-surface/[0.03] text-on-surface-dim/40'
      : pressedDir.value === dir
        ? 'border-on-surface/30 bg-on-surface/20 text-on-surface scale-95'
        : 'cursor-pointer border-on-surface/[0.12] bg-on-surface/[0.06] text-on-surface hover:bg-on-surface/[0.14] active:scale-95',
  ].join(' ');
</script>

<template>
  <div class="glass-card gap-md p-md sm:p-x-lg flex h-full min-h-0 w-full flex-col items-center">
    <div class="gap-sm flex w-full shrink-0 items-center">
      <Icon
        name="material-symbols:gamepad-outline"
        size="1.8rem"
        class="text-on-surface-dim shrink-0"
      />
      <h2 class="text-heading-x-sm text-on-surface font-display font-bold">
        {{ t('remote.droneControl.controls.title') }}
      </h2>
    </div>

    <div class="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
      <div class="gap-sm grid grid-cols-3">
        <div />
        <button
          type="button"
          :disabled="disabled"
          :aria-label="t('remote.droneControl.controls.forward')"
          :class="arrowBtnClass('forward')"
          @click="emit('move', 'forward')"
        >
          <Icon
            name="material-symbols:arrow-upward"
            size="2.4rem"
          />
        </button>
        <div />

        <button
          type="button"
          :disabled="disabled"
          :aria-label="t('remote.droneControl.controls.left')"
          :class="arrowBtnClass('left')"
          @click="emit('move', 'left')"
        >
          <Icon
            name="material-symbols:arrow-back"
            size="2.4rem"
          />
        </button>

        <div class="flex h-[5.6rem] w-[5.6rem] items-center justify-center">
          <div
            :class="[
              'h-[2rem] w-[2rem] rounded-full border transition-colors duration-300',
              !disabled ? 'border-on-surface/25 bg-on-surface/[0.12]' : 'border-on-surface/[0.08] bg-on-surface/[0.04]',
            ]"
          />
        </div>

        <button
          type="button"
          :disabled="disabled"
          :aria-label="t('remote.droneControl.controls.right')"
          :class="arrowBtnClass('right')"
          @click="emit('move', 'right')"
        >
          <Icon
            name="material-symbols:arrow-forward"
            size="2.4rem"
          />
        </button>

        <div />
        <button
          type="button"
          :disabled="disabled"
          :aria-label="t('remote.droneControl.controls.backward')"
          :class="arrowBtnClass('backward')"
          @click="emit('move', 'backward')"
        >
          <Icon
            name="material-symbols:arrow-downward"
            size="2.4rem"
          />
        </button>
        <div />
      </div>
    </div>

    <p class="gap-x-sm text-body-x-sm text-on-surface-dim/50 flex shrink-0 items-center">
      <Icon
        name="material-symbols:keyboard-outline"
        size="1.4rem"
      />
      {{ t('remote.droneControl.controls.keyboardHint') }}
    </p>
  </div>
</template>
