import { toTypedSchema } from '@vee-validate/zod';

import { registerSchema } from '../schemas/register.schema';
import { useAuthService } from '../services/auth.service';

const schema = toTypedSchema(registerSchema);

export const useRegister = () => {
  const { t } = useI18n();
  const authService = useAuthService();
  const localePath = useLocalePath();

  const apiError = ref<string | null>(null);

  const { defineField, handleSubmit, errors, isSubmitting } = useForm({
    validationSchema: schema,
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [firstName, firstNameAttrs] = defineField('firstName');
  const [lastName, lastNameAttrs] = defineField('lastName');
  const [email, emailAttrs] = defineField('email');
  const [password, passwordAttrs] = defineField('password');
  const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword');

  const onSubmit = handleSubmit(async (values) => {
    apiError.value = null;

    try {
      await authService.register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      const loginUrl = `${localePath('/login')}?registered=true`;
      await navigateTo(loginUrl);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; status?: number };

      if (error?.status === 409) {
        apiError.value = t('auth.errors.emailAlreadyExists');
      } else {
        apiError.value = error?.data?.message ?? t('auth.errors.unknownError');
      }
    }
  });

  return {
    firstName,
    firstNameAttrs,
    lastName,
    lastNameAttrs,
    email,
    emailAttrs,
    password,
    passwordAttrs,
    confirmPassword,
    confirmPasswordAttrs,
    errors,
    isSubmitting,
    apiError,
    onSubmit,
  };
};
