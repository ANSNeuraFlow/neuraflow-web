<script setup lang="ts">
import type { ChannelKey } from '../models/eeg-display.domain';
import { EEG_CHANNEL_COLORS } from '../models/eeg-display.domain';
import type { EegLineSeries } from '../models/eeg-line-series.domain';
import { toLineChartValues } from '../utils/eeg-chart.utils';

const props = defineProps<{
  labelKey: string;
  channels: [ChannelKey, ChannelKey];
  buffers: Record<ChannelKey, number[]>;
}>();

const { t } = useI18n();

const activeChannels = reactive<Record<ChannelKey, boolean>>({
  ch1: false,
  ch2: false,
  ch3: false,
  ch4: false,
  ch5: false,
  ch6: false,
  ch7: false,
  ch8: false,
});

onMounted(() => {
  activeChannels[props.channels[0]] = true;
  activeChannels[props.channels[1]] = true;
});

const toggleChannel = (ch: ChannelKey) => {
  const other = props.channels.find((c) => c !== ch)!;
  if (activeChannels[ch] && !activeChannels[other]) return;
  activeChannels[ch] = !activeChannels[ch];
};

const series = computed<EegLineSeries[]>(() =>
  props.channels
    .filter((ch) => activeChannels[ch])
    .map((ch) => ({
      name: ch.toUpperCase(),
      data: toLineChartValues(props.buffers[ch]),
      color: EEG_CHANNEL_COLORS[ch],
    })),
);

const sampleCount = computed(() => props.buffers[props.channels[0]]?.length ?? 0);
</script>

<template>
  <div class="glass-card gap-md p-x-lg flex flex-col">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-body-x-sm font-semibold uppercase tracking-wider text-neural-400">
          {{ t(labelKey) }}
        </p>
        <p class="mt-x-tiny text-body-x-sm text-on-surface-dim">
          {{ sampleCount }}&nbsp;{{ $t('eegLive.eeg.samples') }}
        </p>
      </div>

      <div class="gap-x-sm flex items-center">
        <button
          v-for="ch in channels"
          :key="ch"
          type="button"
          :aria-pressed="activeChannels[ch]"
          :aria-label="`${activeChannels[ch] ? $t('eegLive.eeg.hideChannel') : $t('eegLive.eeg.showChannel')} ${ch.toUpperCase()}`"
          class="gap-x-tiny px-md py-xx-sm text-body-x-sm duration-short flex items-center rounded-sm border font-medium transition-all"
          :class="
            activeChannels[ch]
              ? 'border-on-surface/20 bg-on-surface/10 text-on-surface'
              : 'border-on-surface/8 text-on-surface-dim bg-transparent opacity-40 hover:opacity-70'
          "
          @click="toggleChannel(ch)"
        >
          <span
            class="h-[0.8rem] w-[0.8rem] shrink-0 rounded-full"
            :style="{ backgroundColor: EEG_CHANNEL_COLORS[ch] }"
          />
          {{ ch.toUpperCase() }}
        </button>
      </div>
    </div>

    <AppLineChart
      :series="series"
      height="md"
    />
  </div>
</template>
