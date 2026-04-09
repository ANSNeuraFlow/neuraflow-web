import { io, type Socket } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const {
    public: { socketIoGatewayUrl },
  } = useRuntimeConfig();

  const socket: Socket = io(`${socketIoGatewayUrl}/cluster`, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 5,
  });

  return {
    provide: {
      clusterSocket: socket,
    },
  };
});
