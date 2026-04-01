import { StatusCodes } from 'http-status-codes';

import { useUserSessionStore } from '#layers/auth/app/store/user-session.store';

export default defineNuxtPlugin(() => {
  const {
    public: { apiBaseUrl },
  } = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: apiBaseUrl,

    onRequest({ options }) {
      options.headers.set('Accept', 'application/json');
    },

    async onResponseError({ response }) {
      const status = response.status;

      if (status === StatusCodes.UNAUTHORIZED) {
        if (import.meta.client) {
          const sessionStore = useUserSessionStore();
          sessionStore.logout();

          const localePath = useLocalePath();
          await navigateTo(localePath('/'));
        }

        // TODO(Error handling): Add a custom error for this.
        throw new Error('Session expired. Please login again.');
      }

      if (status >= StatusCodes.INTERNAL_SERVER_ERROR) {
        createError({ fatal: true, status, data: response._data });
      }

      throw createError({ status, data: response._data });
    },
  });

  return {
    provide: {
      api,
    },
  };
});
