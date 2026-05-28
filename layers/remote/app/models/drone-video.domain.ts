export type DroneVideoStreamStatus = 'none' | 'pending' | 'active' | 'ended';

export interface DroneVideoActiveStream {
  streamKey: string | null;
  status: DroneVideoStreamStatus | string;
  playbackAvailable: boolean;
}

export interface DroneVideoWatchCredentials {
  streamKey: string | null;
  token: string | null;
  playbackAvailable: boolean;
}

export type DroneVideoSignalingMessage =
  | { type: 'routerRtpCapabilities'; data: unknown }
  | {
      type: 'webRtcTransportCreated';
      data: { id: string; iceParameters: unknown; iceCandidates: unknown; dtlsParameters: unknown };
    }
  | { type: 'webRtcTransportConnected'; transportId: string }
  | { type: 'consumed'; data: { id: string; producerId: string; kind: string; rtpParameters: unknown } }
  | { type: 'consumerResumed'; consumerId: string }
  | { type: 'error'; message: string };
