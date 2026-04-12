import type { EegDisplaySample } from '../dtos/eeg-display-sample.dto';

export type EegSample = EegDisplaySample;

export type ChannelKey = keyof Omit<EegSample, 'timestamp' | 'marker'>;

export type EegTileConfig = {
  id: number;
  channels: [ChannelKey, ChannelKey];
  labelKey: string;
};

export const EEG_CHANNEL_COLORS: Record<ChannelKey, string> = {
  ch1: '#818cf8',
  ch2: '#22d3ee',
  ch3: '#a5b4fc',
  ch4: '#06b6d4',
  ch5: '#6366f1',
  ch6: '#0891b2',
  ch7: '#4f46e5',
  ch8: '#4338ca',
};

export const EEG_TILES: EegTileConfig[] = [
  { id: 1, channels: ['ch1', 'ch2'], labelKey: 'eegLive.eeg.tiles.tile1' },
  { id: 2, channels: ['ch3', 'ch4'], labelKey: 'eegLive.eeg.tiles.tile2' },
  { id: 3, channels: ['ch5', 'ch6'], labelKey: 'eegLive.eeg.tiles.tile3' },
  { id: 4, channels: ['ch7', 'ch8'], labelKey: 'eegLive.eeg.tiles.tile4' },
];

export const EEG_WINDOW_SIZE = 500;

export const EEG_CHANNELS: ChannelKey[] = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8'];
