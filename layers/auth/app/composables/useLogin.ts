import { toTypedSchema } from '@vee-validate/zod';

import { loginSchema } from '../schemas/login.schema';
import { useAuthService } from '../services/auth.service';
import { useUserSessionStore } from '../store/user-session.store';

const schema = toTypedSchema(loginSchema);

export const useLogin = () => {
  const { t } = useI18n();
  const authService = useAuthService();
  const localePath = useLocalePath();

  const apiError = ref<string | null>(null);
  const passwordChangeEmail = ref<string | null>(null);

  const { defineField, handleSubmit, errors, isSubmitting } = useForm({
    validationSchema: schema,
    initialValues: {
      email: '',
      password: '',
    },
  });

  const [email, emailAttrs] = defineField('email');
  const [password, passwordAttrs] = defineField('password');

  const onSubmit = handleSubmit(async (values) => {
    apiError.value = null;
    passwordChangeEmail.value = null;

    try {
      const response = await authService.login(values);

      if ('message' in response && response.message === 'PASSWORD_CHANGE_REQUIRED') {
        passwordChangeEmail.value = response.email;
        return;
      }

      const me = await authService.me();
      const sessionStore = useUserSessionStore();
      sessionStore.setUser({
        id: me.id,
        firstName: me.firstName,
        lastName: me.lastName,
        email: me.email,
        role: me.role,
        permissions: me.permissions,
      });

      await navigateTo(localePath('/'));
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      apiError.value = error?.data?.message ?? t('auth.errors.unknownError');
    }
  });

  return {
    email,
    emailAttrs,
    password,
    passwordAttrs,
    errors,
    isSubmitting,
    apiError,
    passwordChangeEmail,
    onSubmit,
  };
};
