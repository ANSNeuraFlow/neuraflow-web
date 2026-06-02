import { useNuxtApp } from 'nuxt/app';
import { ref } from 'vue';

import { useEegSessionService } from '#layers/eeg-sessions/app/services/eeg-session.service';
import { makeLocalMarkerSender } from '#layers/machine-learning/app/composables/eeg-ingress.utils';

import { SSVEP_FREQUENCY_TO_MARKER } from '../constants/ssvep.const';

export function useSsvepSession() {
  const nuxtApp = useNuxtApp();
  const { createSession, stopSession } = useEegSessionService();
  const sessionId = ref<string | null>(null);
  const sendLocalMarker = makeLocalMarkerSender(nuxtApp);

  const startRecording = async (protocol: 'ssvep_calibration' | 'ssvep_control', name: string) => {
    const session = await createSession({ sessionName: name, protocolName: protocol });
    sessionId.value = session.id;
    nuxtApp.$bciBridge?.sendJson?.({
      type: 'SESSION_START',
      sessionId: session.id,
    });
    return session;
  };

  const emitFrequencyMarker = async (frequency: number, trialIndex?: number) => {
    const marker = SSVEP_FREQUENCY_TO_MARKER[frequency] ?? `SSVEP_${frequency}HZ`;
    await sendLocalMarker(marker);
    if (trialIndex !== undefined) {
      nuxtApp.$bciBridge?.sendJson?.({
        type: 'MARKER',
        marker,
        trialIndex,
      });
    }
  };

  const endRecording = async () => {
    if (sessionId.value) {
      nuxtApp.$bciBridge?.sendJson?.({ type: 'SESSION_END', sessionId: sessionId.value });
      await stopSession(sessionId.value);
      sessionId.value = null;
    }
  };

  return {
    sessionId,
    startRecording,
    emitFrequencyMarker,
    endRecording,
  };
}
