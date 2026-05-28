import { useApi } from '#layers/core/app/composables/useApi';

import { droneVideoWatchCredentialsDto } from '../dtos/drone-video.dto';
import type { DroneVideoSignalingMessage } from '../models/drone-video.domain';

const POLL_MS = 1000;
const BASE_RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_DELAY_MS = 30000;

type MediasoupClientModule = typeof import('mediasoup-client');
type MediasoupDevice = import('mediasoup-client').Device;
type MediasoupTransport = import('mediasoup-client').types.Transport;
type MediasoupConsumer = import('mediasoup-client').types.Consumer;

let connectionOwnerCount = 0;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let destroyed = false;
let device: MediasoupDevice | null = null;
let recvTransport: MediasoupTransport | null = null;
let consumer: MediasoupConsumer | null = null;
let mediasoupClient: MediasoupClientModule | null = null;
let socket: WebSocket | null = null;
let reconnectAttempt = 0;

export function useDroneVideo() {
  const { get } = useApi();
  const {
    public: { videoStreamWsUrl },
  } = useRuntimeConfig();

  const videoStream = useState<MediaStream | null>('drone-video-stream', () => null);
  const isConnected = useState('drone-video-connected', () => false);
  const isLoading = useState('drone-video-loading', () => false);
  const isWaitingForStream = useState('drone-video-waiting', () => false);
  const error = useState<string | null>('drone-video-error', () => null);

  const wsBaseUrl = String(videoStreamWsUrl);

  const cleanupMedia = () => {
    consumer?.close();
    consumer = null;
    recvTransport?.close();
    recvTransport = null;
    device = null;
    videoStream.value = null;
    isConnected.value = false;
  };

  const cleanupSocket = () => {
    socket?.close();
    socket = null;
  };

  const disconnect = () => {
    destroyed = true;
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    cleanupSocket();
    cleanupMedia();
    isLoading.value = false;
    isWaitingForStream.value = false;
  };

  const waitForMessage = (type: string): Promise<DroneVideoSignalingMessage> =>
    new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const handler = (event: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(event.data) as DroneVideoSignalingMessage;
          if (msg.type === 'error') {
            socket?.removeEventListener('message', handler);
            reject(new Error(msg.message));
            return;
          }
          if (msg.type === type) {
            socket?.removeEventListener('message', handler);
            resolve(msg);
          }
        } catch (e) {
          socket?.removeEventListener('message', handler);
          reject(e);
        }
      };

      socket.addEventListener('message', handler);
    });

  const sendMessage = (payload: Record<string, unknown>) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    socket.send(JSON.stringify(payload));
  };

  const connectWithCredentials = async (streamKey: string, token: string) => {
    if (!mediasoupClient) {
      mediasoupClient = await import('mediasoup-client');
    }

    cleanupSocket();
    cleanupMedia();
    isLoading.value = true;
    error.value = null;

    const url = `${wsBaseUrl}?streamKey=${encodeURIComponent(streamKey)}&token=${encodeURIComponent(token)}`;
    socket = new WebSocket(url);

    await new Promise<void>((resolve, reject) => {
      if (!socket) {
        reject(new Error('WebSocket init failed'));
        return;
      }

      socket.onopen = () => resolve();
      socket.onerror = () => reject(new Error('WebSocket connection failed'));
      socket.onclose = () => {
        if (!destroyed) {
          isConnected.value = false;
          scheduleReconnect();
        }
      };
    });

    const capsMsg = (await waitForMessage('routerRtpCapabilities')) as Extract<
      DroneVideoSignalingMessage,
      { type: 'routerRtpCapabilities' }
    >;

    device = new mediasoupClient.Device();
    await device.load({ routerRtpCapabilities: capsMsg.data as import('mediasoup-client').types.RtpCapabilities });

    sendMessage({ type: 'createWebRtcTransport' });
    const transportMsg = (await waitForMessage('webRtcTransportCreated')) as Extract<
      DroneVideoSignalingMessage,
      { type: 'webRtcTransportCreated' }
    >;

    recvTransport = device.createRecvTransport({
      id: transportMsg.data.id,
      iceParameters: transportMsg.data.iceParameters as import('mediasoup-client').types.IceParameters,
      iceCandidates: transportMsg.data.iceCandidates as import('mediasoup-client').types.IceCandidate[],
      dtlsParameters: transportMsg.data.dtlsParameters as import('mediasoup-client').types.DtlsParameters,
    });

    recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
      try {
        sendMessage({
          type: 'connectWebRtcTransport',
          transportId: recvTransport!.id,
          dtlsParameters,
        });
        void waitForMessage('webRtcTransportConnected')
          .then(() => callback())
          .catch(errback);
      } catch (e) {
        errback(e instanceof Error ? e : new Error(String(e)));
      }
    });

    sendMessage({
      type: 'consume',
      transportId: recvTransport.id,
      rtpCapabilities: device.rtpCapabilities,
    });

    const consumedMsg = (await waitForMessage('consumed')) as Extract<DroneVideoSignalingMessage, { type: 'consumed' }>;

    consumer = await recvTransport.consume({
      id: consumedMsg.data.id,
      producerId: consumedMsg.data.producerId,
      kind: consumedMsg.data.kind as import('mediasoup-client').types.MediaKind,
      rtpParameters: consumedMsg.data.rtpParameters as import('mediasoup-client').types.RtpParameters,
    });

    sendMessage({ type: 'resumeConsumer', consumerId: consumer.id });
    await waitForMessage('consumerResumed');

    const stream = new MediaStream();
    stream.addTrack(consumer.track);
    videoStream.value = stream;
    isConnected.value = true;
    isWaitingForStream.value = false;
    isLoading.value = false;
    reconnectAttempt = 0;
    if (import.meta.dev) {
      console.info('[video-pipeline] WebRTC playback connected');
    }
  };

  const scheduleReconnect = () => {
    if (destroyed || reconnectTimer) {
      return;
    }
    const delay = Math.min(BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempt, MAX_RECONNECT_DELAY_MS);
    reconnectAttempt += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connect();
    }, delay);
  };

  const connect = async () => {
    if (!import.meta.client || destroyed) {
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      const credentials = droneVideoWatchCredentialsDto.parse(await get('/video-stream/watch-credentials'));

      if (!credentials.streamKey || !credentials.token) {
        isWaitingForStream.value = true;
        isConnected.value = false;
        cleanupMedia();
        cleanupSocket();
        isLoading.value = false;
        return;
      }

      if (!credentials.playbackAvailable) {
        isWaitingForStream.value = true;
        isConnected.value = false;
        isLoading.value = false;
        return;
      }

      await connectWithCredentials(credentials.streamKey, credentials.token);
      reconnectAttempt = 0;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to connect video stream';
      isConnected.value = false;
      isLoading.value = false;
      scheduleReconnect();
    }
  };

  const startPolling = () => {
    if (pollTimer) {
      return;
    }
    pollTimer = setInterval(() => {
      if (!isConnected.value && !isLoading.value) {
        void connect();
      }
    }, POLL_MS);
  };

  onMounted(() => {
    if (!import.meta.client) {
      return;
    }
    connectionOwnerCount += 1;
    if (connectionOwnerCount === 1) {
      destroyed = false;
      reconnectAttempt = 0;
      void connect();
      startPolling();
    }
  });

  onBeforeUnmount(() => {
    connectionOwnerCount = Math.max(0, connectionOwnerCount - 1);
    if (connectionOwnerCount === 0) {
      disconnect();
    }
  });

  return {
    videoStream,
    isConnected,
    isLoading,
    isWaitingForStream,
    error,
    connect,
    disconnect,
  };
}
