import type { EegSession } from '../models/eeg-session.domain';
import { useEegSessionService } from '../services/eeg-session.service';

export const useDeleteEegSession = (onSuccess: () => void) => {
  const { t } = useI18n();
  const sessionService = useEegSessionService();

  const targetSession = ref<EegSession | null>(null);
  const isDeleting = ref(false);
  const apiError = ref<string | null>(null);

  const open = (session: EegSession) => {
    targetSession.value = session;
    apiError.value = null;
  };

  const close = () => {
    targetSession.value = null;
    apiError.value = null;
  };

  const confirm = async () => {
    if (!targetSession.value) return;
    isDeleting.value = true;
    apiError.value = null;

    try {
      await sessionService.deleteSession(targetSession.value.id);
      close();
      onSuccess();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      apiError.value = e?.data?.message ?? t('eegSessions.errors.deleteFailed');
    } finally {
      isDeleting.value = false;
    }
  };

  return { targetSession, isDeleting, apiError, open, close, confirm };
};
