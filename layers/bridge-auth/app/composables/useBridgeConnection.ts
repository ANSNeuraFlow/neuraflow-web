import { onMounted, ref } from 'vue';

import { useBridgeStreamService } from '#layers/bridge-auth/app/services/bridge-stream.service';

const POLL_MS = 2000;
const CONNECT_TIMEOUT_MS = 30_000;
const STREAM_WAIT_MS = 45_000;

/** Shared state: bridge connection UI may be used from several components. */
const isConnected = ref(false);
const streamConnected = ref(false);
const isStreaming = ref(false);
const isConnecting = ref(false);
const isStartingStream = ref(false);
const error = ref<string | null>(null);

let initialFetchDone = false;

export const useBridgeConnection = () => {
  const service = useBridgeStreamService();

  const applyStatus = (s: { controlConnected: boolean; streamConnected: boolean; streaming: boolean }) => {
    isConnected.value = s.controlConnected;
    streamConnected.value = s.streamConnected;
    isStreaming.value = s.streaming;
  };

  const fetchStatus = async () => {
    try {
      console.log('[BridgeConnection] Fetching status...');
      const s = await service.getStatus();
      console.log('[BridgeConnection] Status received:', s);
      applyStatus(s);
      error.value = null;
    } catch (e) {
      console.error('[BridgeConnection] Status fetch error:', e);
      error.value = e instanceof Error ? e.message : 'Status request failed';
    }
  };

  const connect = async () => {
    if (!import.meta.client) {
      return;
    }

    error.value = null;
    isConnecting.value = true;

    const params = new URLSearchParams({
      clientId: 'cyton_bridge',
      redirectUri: 'http://localhost:8787/callback',
      state: crypto.randomUUID(),
    });

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `cyton-bridge://connect?${params.toString()}`;
    document.body.appendChild(iframe);

    setTimeout(() => {
      iframe.remove();
    }, 1000);

    const deadline = Date.now() + CONNECT_TIMEOUT_MS;

    try {
      while (Date.now() < deadline) {
        await fetchStatus();
        if (isConnected.value) {
          break;
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
      if (!isConnected.value) {
        error.value = 'Bridge did not connect in time. Open the Cyton Bridge app and try again.';
      }
    } finally {
      isConnecting.value = false;
    }
  };

  const waitForStreaming = async (target: boolean) => {
    const deadline = Date.now() + STREAM_WAIT_MS;
    while (Date.now() < deadline) {
      await fetchStatus();
      if (isStreaming.value === target) {
        return true;
      }
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
    return false;
  };

  const startStreaming = async () => {
    error.value = null;
    isStartingStream.value = true;
    try {
      await service.sendCommand('start_streaming');
      const ok = await waitForStreaming(true);
      if (!ok) {
        error.value = 'Streaming did not start in time.';
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to start streaming';
    } finally {
      isStartingStream.value = false;
    }
  };

  const stopStreaming = async (opts?: { waitForDeviceStopped?: boolean }) => {
    const wait = opts?.waitForDeviceStopped ?? false;
    error.value = null;
    try {
      await service.sendCommand('stop_streaming');
      if (wait) await waitForStreaming(false);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to stop streaming';
    }
  };

  const setSession = async (sessionId: string) => {
    error.value = null;
    try {
      await service.setSession(sessionId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to bind bridge session';
      throw e;
    }
  };

  const clearSession = async () => {
    error.value = null;
    try {
      await service.clearSession();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to clear bridge session';
      throw e;
    }
  };

  onMounted(() => {
    if (import.meta.client && !initialFetchDone) {
      initialFetchDone = true;
      void fetchStatus();
    }
  });

  return {
    isConnected,
    streamConnected,
    isStreaming,
    isConnecting,
    isStartingStream,
    error,
    connect,
    startStreaming,
    stopStreaming,
    setSession,
    clearSession,
    fetchStatus,
  };
};
