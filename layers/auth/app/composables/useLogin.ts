import { toTypedSchema } from '@vee-validate/zod';

import { loginSchema } from '../schemas/login.schema';
import { useAuthService } from '../services/auth.service';
import { useUserSessionStore } from '../store/user-session.store';

const schema = toTypedSchema(loginSchema);

const isSafeRedirectTarget = (target: unknown): target is string => {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//');
};

export const useLogin = () => {
  const { t } = useI18n();
  const authService = useAuthService();
  const localePath = useLocalePath();
  const route = useRoute();

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

      const redirectTarget = route.query.redirect;
      if (isSafeRedirectTarget(redirectTarget)) {
        await navigateTo(redirectTarget);
      } else {
        await navigateTo(localePath('/'));
      }
    } catch (err: unknown) {
      console.error('[useLogin] error:', err);
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
