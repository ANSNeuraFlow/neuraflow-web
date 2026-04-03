import { toTypedSchema } from '@vee-validate/zod';

import type { AdminUser } from '../models/admin-api.domain';
import { updateRoleSchema } from '../schemas/update-role.schema';
import { useAdminService } from '../services/admin.service';

export const useUpdateUserRole = (onSuccess: () => void) => {
  const { t } = useI18n();
  const adminService = useAdminService();

  const schema = toTypedSchema(updateRoleSchema);
  const apiError = ref<string | null>(null);
  const targetUser = ref<AdminUser | null>(null);

  const { defineField, handleSubmit, errors, isSubmitting, resetForm, setValues } = useForm({
    validationSchema: schema,
    initialValues: { roleId: undefined as unknown as number },
  });

  const [roleIdRaw, roleIdAttrs] = defineField('roleId');

  const roleId = computed<string | number | null | undefined>({
    get: () => roleIdRaw.value as string | number | null | undefined,
    set: (value) => {
      roleIdRaw.value = value as never;
    },
  });

  const open = (user: AdminUser) => {
    targetUser.value = user;
    setValues({ roleId: user.roleId ?? undefined });
    apiError.value = null;
  };

  const close = () => {
    targetUser.value = null;
    resetForm();
    apiError.value = null;
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!targetUser.value) return;
    apiError.value = null;

    try {
      await adminService.updateUserRole(targetUser.value.id, { roleId: values.roleId });
      close();
      onSuccess();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      apiError.value = e?.data?.message ?? t('admin.errors.updateRoleFailed');
    }
  });

  return {
    targetUser,
    roleId,
    roleIdAttrs,
    errors,
    isSubmitting,
    apiError,
    open,
    close,
    onSubmit,
  };
};
