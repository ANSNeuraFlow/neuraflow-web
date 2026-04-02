import type { RouteLocationNormalizedGeneric } from 'vue-router';

import type { LoggedUser } from '../models/user-session.domain';

export const useAuthRedirects = () => {
  const localePath = useLocalePath();

  const redirectAuthenticated = (
    to: RouteLocationNormalizedGeneric,
    _from: RouteLocationNormalizedGeneric,
    user: LoggedUser,
  ) => {
    const requiredPermissions = to.meta.requiredPermissions;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return;
    }

    const userPermissionNames = user.permissions.map((p) => p.name);

    const userHasAllRequiredPermissions = requiredPermissions.every((required) =>
      userPermissionNames.includes(required as string),
    );

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
