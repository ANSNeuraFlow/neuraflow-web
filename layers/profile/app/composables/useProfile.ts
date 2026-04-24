import type { UserProfile } from '../models/profile.domain';
import { useProfileService } from '../services/profile.service';

export const useProfile = () => {
  const { t } = useI18n();
  const profileService = useProfileService();

  const profile = ref<UserProfile | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchProfile = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      profile.value = await profileService.getProfile();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      error.value = e?.data?.message ?? t('profile.errors.fetchFailed');
    } finally {
      isLoading.value = false;
    }
  };

  const fullName = computed(() => (profile.value ? `${profile.value.firstName} ${profile.value.lastName}` : ''));

  const memberSince = computed(() => {
    if (!profile.value) return '';
    return new Date(profile.value.createdAt).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
    });
  });

  const lastLoginFormatted = computed(() => {
    if (!profile.value?.lastLogin) return null;
    return new Date(profile.value.lastLogin).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  onMounted(fetchProfile);

  return { profile, isLoading, error, fullName, memberSince, lastLoginFormatted, fetchProfile };
};
