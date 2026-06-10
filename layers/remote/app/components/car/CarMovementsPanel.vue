<script setup lang="ts">
import { useCarState } from '../../composables/useCarState';
import { useRcCarBridge } from '../../composables/useRcCarBridge';

const { t } = useI18n();
const car = useCarState();
const bridge = useRcCarBridge();
</script>

<template>
  <div class="glass-card gap-md p-md sm:p-x-lg flex flex-col">
    <div class="gap-sm flex items-center justify-between">
      <div class="gap-sm flex items-center">
        <Icon
          name="material-symbols:route-outline"
          size="1.8rem"
          class="text-on-surface-dim shrink-0"
        />
        <h2 class="text-heading-x-sm text-on-surface font-display font-bold">
          {{ t('remote.carControl.movements.title') }}
        </h2>
      </div>

      <AppButton
        v-if="bridge.movementRunning.value"
        variant="destructive"
        size="sm"
        @click="car.cancelMovement()"
      >
        <Icon
          name="material-symbols:stop-circle-outline"
          size="1.6rem"
          class="mr-xs"
        />
        {{ t('remote.carControl.movements.stop') }}
      </AppButton>
    </div>

    <p
      v-if="bridge.movementRunning.value && bridge.activeMovement.value"
      class="text-body-sm text-success font-medium"
    >
      {{ t('remote.carControl.movements.running', { label: bridge.activeMovement.value }) }}
    </p>

    <div
      v-if="bridge.movements.value.length === 0"
      class="text-body-sm text-on-surface-dim/50 py-sm italic"
    >
      {{ t('remote.carControl.movements.empty') }}
    </div>

    <div
      v-else
      class="gap-sm flex flex-wrap"
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
