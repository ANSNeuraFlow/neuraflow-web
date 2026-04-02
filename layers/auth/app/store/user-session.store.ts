import { STORE_KEYS } from '#layers/core/app/constants/store-keys';

import type { LoggedUser } from '../models/user-session.domain';

export const useUserSessionStore = defineStore(
  STORE_KEYS.USER_SESSION,
  () => {
    const user = ref<LoggedUser | undefined>(undefined);

    const isAuthenticated = computed(() => !!user.value);

    const setUser = (data: LoggedUser) => {
      user.value = data;
    };

    const logout = () => {
      user.value = undefined;
    };

    return { user, isAuthenticated, setUser, logout };
  },
  { persist: true },
);
