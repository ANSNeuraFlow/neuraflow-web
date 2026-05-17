import type { useNuxtApp } from 'nuxt/app';
import type { Ref } from 'vue';

import type { EegProtocolId } from '#layers/eeg-sessions/app/constants/eeg-protocols.const';
import { useEegSessionService } from '#layers/eeg-sessions/app/services/eeg-session.service';

import type { EegIngressMode } from '../models/eeg-ingress.domain';

// ------------- Integracja EEG: mostek NeuraFlow vs lokalny WebSocket -----------

// ------------- Typy: stan mostka i wysyłka markerów ----------------------------
export interface BridgeHandle {
  fetchStatus: () => Promise<void>;
  isConnected: Ref<boolean>;
  isStreaming: Ref<boolean>;
  streamConnected: Ref<boolean>;
  setSession: (id: string) => Promise<void>;
}

export type MarkerSender = (marker: string) => Promise<void>;

// ------------- Fabryki senderów markerów (Kafka vs lokalny bridge) ------------
export function makeNeuraflowMarkerSender(sendMarker: (m: string) => Promise<unknown>, label: string): MarkerSender {
  return async (marker: string) => {
    try {
      await sendMarker(marker);
    } catch (e) {
      console.error(`[${label}] Marker send failed:`, e);
    }
  };
}

export function makeLocalMarkerSender(nuxtApp: ReturnType<typeof useNuxtApp>): MarkerSender {
  return async (marker: string) => {
    const ok = nuxtApp.$bciBridge?.sendJson?.({ type: 'MARKER', marker });
    if (!ok) console.warn('[Local bridge] MARKER dropped:', marker);
  };
}

// ------------- Zdarzenia cyklu sesji przez lokalny WebSocket -------------------
export function sendLocalLifecycleEvent(
  nuxtApp: ReturnType<typeof useNuxtApp>,
  kind: 'SESSION_START' | 'SESSION_END' | 'SESSION_ABORTED',
  sessionId: string,
  token?: string,
): void {
  const payload: Record<string, unknown> =
    kind === 'SESSION_START' ? { type: kind, sessionId, token: token ?? '' } : { type: kind, sessionId };
  const ok = nuxtApp.$bciBridge?.sendJson?.(payload);
  if (!ok) console.warn('[Local bridge] lifecycle dropped:', kind);
}

// ------------- Mapowanie klas kalibracji BCI → protokół zapisany na serwerze ----
export function resolveBciEegProtocolId(classes: string[]): EegProtocolId {
  const uniq = [...new Set(classes.map((s) => s.toUpperCase()))];
  return uniq.includes('UP') || uniq.includes('DOWN') ? 'move_forward' : 'move_left';
}

// ------------- Warunki startu: mostek połączony i strumień aktywny ------------
export async function assertBridgeIngressReady(bridge: BridgeHandle): Promise<void> {
  await bridge.fetchStatus();
  if (!bridge.isConnected.value) throw new Error('bridge_not_connected');
  if (!bridge.isStreaming.value) throw new Error('bridge_not_streaming');
  if (!bridge.streamConnected.value) throw new Error('bridge_stream_uplink_missing');
}

// ------------- Warunki startu: lokalny WebSocket BCI -----------------------------
export function assertLocalWsReady(isConnected: Ref<boolean>): void {
  if (!isConnected.value) throw new Error('local_ws_not_connected');
}

// ------------- Utworzenie sesji EEG i powiązanie z mostkiem (opcjonalnie) -------
export async function createBoundSession(
  sessionName: string,
  protocolName: EegProtocolId,
  bridge: BridgeHandle,
  mode: EegIngressMode,
): Promise<string> {
  const { createSession } = useEegSessionService();
  const session = await createSession({ sessionName, protocolName });
  if (mode === 'neuraflow-bridge') {
    await bridge.setSession(session.id);
  }
  return session.id;
}
