<script setup lang="ts">
import { type ForwardGateConfig, SESSION_DURATIONS } from '../../composables/useForwardGate';

defineOptions({ name: 'ForwardGateConfigPanel' });

defineProps<{
  config: ForwardGateConfig;
}>();

const emit = defineEmits<{
  (e: 'update:config', config: ForwardGateConfig): void;
}>();

const { t } = useI18n();
</script>

<template>
  <div class="glass-card p-x-lg gap-x-lg flex h-full flex-col">
    <div class="gap-md flex items-center">
      <div
        class="bg-on-surface/10 text-on-surface flex h-[4rem] w-[4rem] shrink-0 items-center justify-center rounded-full"
      >
        <Icon
          name="lucide:timer"
          size="2rem"
        />
      </div>
      <div>
        <h2 class="text-heading-sm text-on-surface font-display font-bold">
          {{ t('movementExercises.forwardGate.config.title') }}
        </h2>
        <p class="text-body-sm text-on-surface-dim mt-xx-sm">
          {{ t('movementExercises.forwardGate.config.subtitle') }}
        </p>
      </div>
    </div>

    <div class="gap-md flex flex-1 flex-col justify-center">
      <p class="text-body-sm text-on-surface-dim font-medium">
        {{ t('movementExercises.forwardGate.config.selectDuration') }}
      </p>

      <div
        class="border-on-surface/[0.08] bg-on-surface/[0.03] divide-on-surface/[0.08] flex w-full max-w-[40rem] divide-x overflow-hidden rounded-xl border"
      >
        <button
          v-for="d in SESSION_DURATIONS"
          :key="d"
          type="button"
          class="text-body-sm px-x-sm py-x-sm sm:px-x-lg sm:py-x-sm min-h-[3.2rem] min-w-0 flex-1 text-center font-semibold transition-colors duration-150"
          :class="
            config.durationMinutes === d
              ? 'bg-on-surface text-surface'
              : 'text-on-surface-dim hover:bg-on-surface/[0.07] hover:text-on-surface'
          "
          @click="emit('update:config', { ...config, durationMinutes: d })"
        >
          {{ t('movementExercises.forwardGate.config.durationLabel', { min: d }) }}
        </button>
      </div>

      <p class="text-body-x-sm text-on-surface-dim leading-relaxed">
        {{ t(`movementExercises.forwardGate.config.durationDesc.${config.durationMinutes}`) }}
      </p>
    </div>
  </div>
</template>
