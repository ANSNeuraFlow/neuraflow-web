import { STORE_KEYS } from '#layers/core/app/constants/store-keys';

import type { UserSession } from '../models/user-session.domain';

export const useUserSessionStore = defineStore(
  STORE_KEYS.USER_SESSION,
  () => {
    const session = ref<UserSession | undefined>(undefined);

    const isAuthenticated = computed(() => !!session.value?.user);

    const logout = () => {
      session.value = undefined;
    };

    return {
      session,
      isAuthenticated,
      logout,
    };
  },
  {
    persist: true,
  },
);
