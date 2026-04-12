<script setup lang="ts">
import type { ChannelKey } from '../models/eeg-display.domain';
import { EEG_CHANNEL_COLORS } from '../models/eeg-display.domain';
import type { EegLineSeries } from '../models/eeg-line-series.domain';
import { toLineChartValues } from '../utils/eeg-chart.utils';

const props = defineProps<{
  channel: ChannelKey;
  buffers: Record<ChannelKey, number[]>;
}>();

const series = computed<EegLineSeries[]>(() => [
  {
    name: props.channel.toUpperCase(),
    data: toLineChartValues(props.buffers[props.channel]),
    color: EEG_CHANNEL_COLORS[props.channel],
  },
]);

const sampleCount = computed(() => props.buffers[props.channel]?.length ?? 0);
</script>

<template>
  <div class="glass-card gap-md p-x-lg flex flex-col">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-body-x-sm font-semibold uppercase tracking-wider text-neural-400">
          {{ props.channel.toUpperCase() }}
        </p>
        <p class="mt-x-tiny text-body-x-sm text-on-surface-dim">
          {{ sampleCount }}&nbsp;{{ $t('eegLive.eeg.samples') }}
        </p>
      </div>
      <span
        class="h-[0.8rem] w-[0.8rem] rounded-full"
        :style="{ backgroundColor: EEG_CHANNEL_COLORS[props.channel] }"
      />
    </div>

    <AppLineChart
      :series="series"
      height="sm"
    />
  </div>
</template>
