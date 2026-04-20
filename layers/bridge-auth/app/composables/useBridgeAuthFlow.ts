import { type BridgeAuthQuery, bridgeAuthQuerySchema } from '../schemas/bridge-auth.schema';
import { useBridgeAuthService } from '../services/bridge-auth.service';

export type BridgeAuthStatus = 'validating' | 'invalid_query' | 'loading' | 'success' | 'error';

export const useBridgeAuthFlow = () => {
  const route = useRoute();
  const service = useBridgeAuthService();

  const status = ref<BridgeAuthStatus>('validating');
  const errorKey = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);
  const query = ref<BridgeAuthQuery | null>(null);

  const parseQuery = (): BridgeAuthQuery | null => {
    const parsed = bridgeAuthQuerySchema.safeParse({
      clientId: route.query.clientId,
      redirectUri: route.query.redirectUri,
      state: route.query.state,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      status.value = 'invalid_query';
      errorKey.value = firstIssue?.message ?? 'bridgeAuth.errors.invalidQuery';
      errorMessage.value = null;
      return null;
    }

    return parsed.data;
  };

  const start = async () => {
    const q = parseQuery();
    if (!q) return;
    query.value = q;

    status.value = 'loading';
    errorKey.value = null;
    errorMessage.value = null;

    try {
      const res = await service.start(q);
      status.value = 'success';

      const url = `${q.redirectUri}?code=${encodeURIComponent(res.code)}&state=${encodeURIComponent(q.state)}`;
      window.location.href = url;
    } catch (err: unknown) {
      console.error('[useBridgeAuthFlow] error:', err);
      const error = err as { data?: { message?: string } };
      status.value = 'error';
      errorKey.value = 'bridgeAuth.errors.backendFailure';
      errorMessage.value = error?.data?.message ?? null;
    }
  };

  const retry = () => {
    void start();
  };

  return {
    status,
    errorKey,
    errorMessage,
    query,
    start,
    retry,
  };
};
