<script setup lang="ts">
import type { CarCommand, CarCommandEntry } from '../../composables/useCarState';

const props = defineProps<{
  entries: CarCommandEntry[];
}>();

const emit = defineEmits<{
  clear: [];
}>();

const { t } = useI18n();

const STATIC_COMMAND_ICONS: Partial<Record<CarCommand, string>> = {
  move_forward: 'material-symbols:arrow-upward',
  move_backward: 'material-symbols:arrow-downward',
  move_left: 'material-symbols:arrow-back',
  move_right: 'material-symbols:arrow-forward',
  cancel_movement: 'material-symbols:stop-circle-outline',
  neutral: 'material-symbols:pause-circle-outline',
  brake: 'material-symbols:stop',
};

const getCommandIcon = (command: CarCommand): string => {
  if (command.startsWith('run_movement:')) return 'material-symbols:route';
  return STATIC_COMMAND_ICONS[command] ?? 'material-symbols:terminal';
};

const getCommandLabel = (command: CarCommand): string => {
  if (command.startsWith('run_movement:')) {
    const movementId = command.slice('run_movement:'.length);
    return t('remote.carControl.timeline.commands.run_movement', { id: movementId });
  }
  return t(`remote.carControl.timeline.commands.${command}`);
};

const formatTime = (date: Date): string =>
  date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
</script>

<template>
  <div class="glass-card gap-md p-md sm:p-x-lg flex min-h-0 w-full flex-col overflow-hidden">
    <div class="flex shrink-0 items-center justify-between">
      <div class="gap-sm flex items-center">
        <Icon
          name="material-symbols:format-list-bulleted"
          size="1.8rem"
          class="text-on-surface-dim shrink-0"
        />
        <h2 class="text-heading-x-sm text-on-surface font-display font-bold">
          {{ t('remote.carControl.timeline.title') }}
        </h2>
      </div>
      <button
        v-if="props.entries.length > 0"
        type="button"
        class="text-body-x-sm text-on-surface-dim/50 duration-short hover:text-on-surface-dim cursor-pointer transition-colors"
        @click="emit('clear')"
      >
        {{ t('remote.carControl.timeline.clear') }}
      </button>
    </div>

    <div
      class="border-on-surface/[0.06] bg-on-surface/[0.02] px-xx-sm py-xx-sm flex h-[20rem] shrink-0 flex-col overflow-y-auto overflow-x-hidden overscroll-contain rounded-lg border sm:h-[22rem] xl:h-[24rem]"
    >
      <div
        v-if="props.entries.length === 0"
        class="py-md flex min-h-0 flex-1 items-center justify-center"
      >
        <p class="text-body-sm text-on-surface-dim/40 px-sm text-center italic">
          {{ t('remote.carControl.timeline.empty') }}
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
            :name="getCommandIcon(entry.command)"
            size="1.6rem"
            class="text-on-surface-dim shrink-0"
          />
          <span class="text-body-sm text-on-surface min-w-0 flex-1 font-medium">
            {{ getCommandLabel(entry.command) }}
          </span>
          <span class="text-body-x-sm text-on-surface-dim/50 shrink-0 font-mono tabular-nums">
            {{ formatTime(entry.timestamp) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
