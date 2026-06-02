import { useNuxtApp, useState } from 'nuxt/app';
import { onUnmounted, ref } from 'vue';

import { useBciController } from '~/composables/useBciController';
import { SSVEP_STATE_KEYS, type SsvepScoresPayload } from '~/models/bci.domain';

export function useSsvepDetection() {
  const nuxtApp = useNuxtApp();
  const { currentCommand, currentConfidence, isConnected, connectionError } = useBciController();

  const frequencyScores = useState<Record<string, number>>(SSVEP_STATE_KEYS.scores, () => ({}));
  const lastScoresAt = ref<number | null>(null);

  if (import.meta.client) {
    const off = nuxtApp.$bciBridge?.subscribeScores?.((payload: SsvepScoresPayload) => {
      frequencyScores.value = payload.scores;
      lastScoresAt.value = payload.timestamp;
    });
    if (off) onUnmounted(off);
  }

  return {
    currentCommand,
    currentConfidence,
    isConnected,
    connectionError,
    frequencyScores,
    lastScoresAt,
  };
}
