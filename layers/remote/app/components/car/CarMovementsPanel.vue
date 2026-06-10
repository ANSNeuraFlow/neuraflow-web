<script setup lang="ts">
import { useCarState } from '../../composables/useCarState';
import { useRcCarBridge } from '../../composables/useRcCarBridge';

withDefaults(
  defineProps<{
    layout?: 'bar' | 'card';
  }>(),
  {
    layout: 'bar',
  },
);

const { t } = useI18n();
const car = useCarState();
const bridge = useRcCarBridge();
</script>

<template>
  <div
    :class="[
      'glass-card w-full',
      layout === 'bar'
        ? 'gap-md p-md sm:px-x-lg sm:py-md flex flex-col sm:flex-row sm:items-center'
        : 'gap-md p-md sm:p-x-lg flex min-h-[22rem] flex-col',
    ]"
  >
    <div :class="['gap-sm flex shrink-0 items-center', layout === 'bar' ? 'sm:min-w-[14rem]' : '']">
      <Icon
        name="material-symbols:route-outline"
        size="1.8rem"
        class="text-on-surface-dim shrink-0"
      />
      <div class="min-w-0">
        <h2 class="text-heading-x-sm text-on-surface font-display font-bold leading-tight">
          {{ t('remote.carControl.movements.title') }}
        </h2>
        <p
          v-if="bridge.movementRunning.value && bridge.activeMovement.value"
          class="text-body-x-sm text-success mt-xx-sm font-medium"
        >
          {{ t('remote.carControl.movements.running', { label: bridge.activeMovement.value }) }}
        </p>
      </div>
    </div>

    <div
      v-if="bridge.movements.value.length === 0"
      :class="[
        'text-body-sm text-on-surface-dim/50 italic',
        layout === 'bar' ? 'sm:flex-1' : 'flex flex-1 items-center justify-center',
      ]"
    >
      {{ t('remote.carControl.movements.empty') }}
    </div>

    <div
      v-else
      :class="[
        'gap-sm flex flex-wrap items-center',
        layout === 'bar' ? 'flex-1 sm:justify-end' : 'flex-1 content-start',
      ]"
    >
      <AppButton
        v-for="movement in bridge.movements.value"
        :key="movement.id"
        variant="secondary"
        size="sm"
        :disabled="bridge.movementRunning.value"
        @click="car.runMovement(movement.id)"
      >
        {{ movement.label }}
      </AppButton>
    </div>
  </div>
</template>
