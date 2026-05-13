export const useBridgeConnection = () => {
  const isConnected = ref(false);
  const isConnecting = ref(false);

  const connect = () => {
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
      document.body.removeChild(iframe);
    }, 1000);
  };

  return {
    isConnected,
    isConnecting,
    connect,
  };
};
