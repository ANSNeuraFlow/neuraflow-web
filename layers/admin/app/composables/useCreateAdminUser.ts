import { toTypedSchema } from '@vee-validate/zod';

import { createUserSchema } from '../schemas/create-user.schema';
import { useAdminService } from '../services/admin.service';

export const useCreateAdminUser = (onSuccess: () => void) => {
  const { t } = useI18n();
  const adminService = useAdminService();

  const schema = toTypedSchema(createUserSchema);
  const apiError = ref<string | null>(null);

  const { defineField, handleSubmit, errors, isSubmitting, resetForm } = useForm({
    validationSchema: schema,
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      temporaryPassword: '',
      roleId: undefined,
    },
  });

  const [email, emailAttrs] = defineField('email');
  const [firstName, firstNameAttrs] = defineField('firstName');
  const [lastName, lastNameAttrs] = defineField('lastName');
  const [temporaryPassword, temporaryPasswordAttrs] = defineField('temporaryPassword');
  const [roleIdRaw, roleIdAttrs] = defineField('roleId');
  const roleId = computed<string | number | null | undefined>({
    get: () => roleIdRaw.value as string | number | null | undefined,
    set: (value) => {
      roleIdRaw.value = value as never;
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    apiError.value = null;

    try {
      await adminService.createUser({
        ...values,
        roleId: values.roleId ?? undefined,
      });

      resetForm();
      onSuccess();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      apiError.value = e?.data?.message ?? t('admin.errors.createFailed');
    }
  });

  return {
    email,
    emailAttrs,
    firstName,
    firstNameAttrs,
    lastName,
    lastNameAttrs,
    temporaryPassword,
    temporaryPasswordAttrs,
    roleId,
    roleIdAttrs,
    errors,
    isSubmitting,
    apiError,
    onSubmit,
    resetForm,
  };
};
