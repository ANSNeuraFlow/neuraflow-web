import type { RouteLocationNormalizedGeneric } from 'vue-router';

import type { UserSession } from '../models/user-session.domain';

export const useAuthRedirects = () => {
  const localePath = useLocalePath();

  const redirectAuthenticated = (
    to: RouteLocationNormalizedGeneric,
    _from: RouteLocationNormalizedGeneric,
    session: UserSession,
  ) => {
    const requiredPermissions = to.meta.requiredPermissions;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return;
    }

    const userPermissions = session.user.permissions;

    if (!userPermissions) {
      return abortNavigation({ message: 'Insufficient permissions' });
    }

    const userHasAllRequiredPermissions = requiredPermissions.every((v) => userPermissions.includes(v));

    if (!userHasAllRequiredPermissions) {
      return abortNavigation({ message: 'Insufficient permissions' });
    }
  };

  const redirectUnauthenticated = (to: RouteLocationNormalizedGeneric, _from: RouteLocationNormalizedGeneric) => {
    const requiredPermissions = to.meta.requiredPermissions;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return;
    }

    return navigateTo(localePath('/'));
  };

  return {
    redirectAuthenticated,
    redirectUnauthenticated,
  };
};
