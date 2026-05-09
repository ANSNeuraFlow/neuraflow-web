<script setup lang="ts">
import type { DroneCommand, DroneCommandEntry } from '../../models/drone-control.domain';

const props = defineProps<{
  entries: DroneCommandEntry[];
}>();

const emit = defineEmits<{
  clear: [];
}>();

const { t } = useI18n();

const commandIconMap: Record<DroneCommand, string> = {
  arm: 'material-symbols:lock-open-outline',
  disarm: 'material-symbols:lock-outline',
  takeoff: 'material-symbols:flight-takeoff',
  land: 'material-symbols:flight-land',
  move_forward: 'material-symbols:arrow-upward',
  move_backward: 'material-symbols:arrow-downward',
  move_left: 'material-symbols:arrow-back',
  move_right: 'material-symbols:arrow-forward',
};

const commandColorClass: Record<DroneCommand, string> = {
  arm: 'text-success',
  disarm: 'text-error',
  takeoff: 'text-on-surface',
  land: 'text-on-surface-dim',
  move_forward: 'text-on-surface-dim',
  move_backward: 'text-on-surface-dim',
  move_left: 'text-on-surface-dim',
  move_right: 'text-on-surface-dim',
};

const formatTime = (date: Date): string =>
  date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
</script>

<template>
  <div class="glass-card gap-md p-md sm:p-x-lg flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden">
    <div class="flex shrink-0 items-center justify-between">
      <div class="gap-sm flex items-center">
        <Icon
          name="material-symbols:format-list-bulleted"
          size="1.8rem"
          class="text-on-surface-dim shrink-0"
        />
        <h2 class="text-heading-x-sm text-on-surface font-display font-bold">
          {{ t('remote.droneControl.timeline.title') }}
        </h2>
      </div>
      <button
        v-if="props.entries.length > 0"
        type="button"
        class="text-body-x-sm text-on-surface-dim/50 duration-short hover:text-on-surface-dim cursor-pointer transition-colors"
        @click="emit('clear')"
      >
        {{ t('remote.droneControl.timeline.clear') }}
      </button>
    </div>

    <div
      class="border-on-surface/[0.06] bg-on-surface/[0.02] px-xx-sm py-xx-sm flex min-h-0 flex-[1_1_0%] flex-col overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg border"
    >
      <div
        v-if="props.entries.length === 0"
        class="py-md flex min-h-0 flex-1 items-center justify-center"
      >
        <p class="text-body-sm text-on-surface-dim/40 px-sm text-center italic">
          {{ t('remote.droneControl.timeline.empty') }}
        </p>
      </div>

      <ul
        v-else
        class="gap-xx-sm flex flex-col"
      >
        <li
          v-for="(entry, index) in props.entries"
          :key="entry.id"
          class="border-on-surface/[0.06] bg-on-surface/[0.02] gap-sm px-sm py-xs flex items-center rounded-lg border"
          :class="index === 0 ? 'opacity-100' : 'opacity-75'"
        >
          <Icon
            :name="commandIconMap[entry.command]"
            size="1.6rem"
            :class="commandColorClass[entry.command]"
            class="shrink-0"
          />
          <span class="text-body-sm text-on-surface min-w-0 flex-1 font-medium">
            {{ t(`remote.droneControl.timeline.commands.${entry.command}`) }}
          </span>
          <span class="text-body-x-sm text-on-surface-dim/50 shrink-0 font-mono tabular-nums">
            {{ formatTime(entry.timestamp) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
