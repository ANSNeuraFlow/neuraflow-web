import type { AdminUser } from '../models/admin-api.domain';
import { useAdminService } from '../services/admin.service';

export const useAdminUsers = () => {
  const { t } = useI18n();
  const adminService = useAdminService();

  const users = ref<AdminUser[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchUsers = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      users.value = await adminService.getUsers();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      error.value = e?.data?.message ?? t('admin.errors.fetchFailed');
    } finally {
      isLoading.value = false;
    }
  };

  const availableRoles = computed(() => [
    ...new Map(
      users.value
        .filter((u) => u.roleId !== null && u.role !== null)
        .map((u) => [u.roleId!, { id: u.roleId!, name: u.role! }]),
    ).values(),
  ]);

  onMounted(fetchUsers);

  return { users, isLoading, error, fetchUsers, availableRoles };
};
