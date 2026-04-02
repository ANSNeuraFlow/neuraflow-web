import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import { useAuthService } from '../services/auth.service';

const schema = toTypedSchema(
  z
    .object({
      firstName: z.string().min(2, 'auth.validation.firstNameMin').max(64),
      lastName: z.string().min(2, 'auth.validation.lastNameMin').max(64),
      email: z.string().min(1, 'auth.validation.emailRequired').email('auth.validation.emailInvalid'),
      password: z.string().min(8, 'auth.validation.passwordMinLength').max(128),
      confirmPassword: z.string().min(1, 'auth.validation.confirmRequired'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'auth.validation.passwordsMustMatch',
      path: ['confirmPassword'],
    }),
);

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

      await navigateTo(localePath('/'));
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
