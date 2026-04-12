import type { EegSession } from '../models/eeg-session.domain';
import { useEegSessionService } from '../services/eeg-session.service';

export const useEegSessions = () => {
  const { t } = useI18n();
  const sessionService = useEegSessionService();

  const sessions = ref<EegSession[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchSessions = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      sessions.value = await sessionService.getSessions();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      error.value = e?.data?.message ?? t('eegSessions.errors.fetchFailed');
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(fetchSessions);

  return { sessions, isLoading, error, fetchSessions };
};
