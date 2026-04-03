import type { AdminUser } from '../models/admin-api.domain';
import { useAdminService } from '../services/admin.service';

export const useDeleteUser = (onSuccess: () => void) => {
  const { t } = useI18n();
  const adminService = useAdminService();

  const targetUser = ref<AdminUser | null>(null);
  const isDeleting = ref(false);
  const apiError = ref<string | null>(null);

  const open = (user: AdminUser) => {
    targetUser.value = user;
    apiError.value = null;
  };

  const close = () => {
    targetUser.value = null;
    apiError.value = null;
  };

  const confirm = async () => {
    if (!targetUser.value) return;
    isDeleting.value = true;
    apiError.value = null;

    try {
      await adminService.deleteUser(targetUser.value.id);
      close();
      onSuccess();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      apiError.value = e?.data?.message ?? t('admin.errors.deleteFailed');
    } finally {
      isDeleting.value = false;
    }
  };

  return {
    targetUser,
    isDeleting,
    apiError,
    open,
    close,
    confirm,
  };
};
