<script setup lang="ts">
import { useEegDisplay } from '../composables/useEegDisplay';
import { EEG_CHANNELS } from '../models/eeg-display.domain';

const { isConnected, wsError, buffers } = useEegDisplay();
</script>

<template>
  <div class="gap-x-lg flex flex-col">
    <div class="gap-x-sm flex items-center">
      <span
        class="h-[0.8rem] w-[0.8rem] rounded-full"
        :class="isConnected ? 'bg-success' : 'bg-error'"
      />
      <span
        class="text-body-x-sm font-semibold"
        :class="isConnected ? 'text-success' : 'text-on-surface-dim'"
      >
        {{ isConnected ? $t('eegLive.connection.live') : $t('eegLive.connection.disconnected') }}
      </span>
      <span class="text-body-x-sm text-on-surface-dim"> — {{ $t('eegLive.eeg.streamLabel') }} </span>
    </div>

    <div
      v-if="wsError"
      class="border-error/30 bg-error/10 p-md text-body-sm text-error rounded-md border"
      role="alert"
    >
      <div class="gap-x-sm flex items-center">
        <Icon
          name="material-symbols:error-outline"
          size="1.6rem"
        />
        {{ wsError }}
      </div>
    </div>

    <p class="text-body-sm font-semibold uppercase tracking-wider text-neural-400">
      {{ $t('eegLive.eeg.debugSingleChartsTitle') }}
    </p>

    <div class="gap-md grid grid-cols-1 lg:grid-cols-2">
      <EegSingleChannelChart
        v-for="channel in EEG_CHANNELS"
        :key="channel"
        :channel="channel"
        :buffers="buffers"
      />
    </div>
  </div>
</template>
