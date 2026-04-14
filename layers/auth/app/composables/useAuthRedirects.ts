import type { RouteLocationNormalizedGeneric } from 'vue-router';

import type { LoggedInUser } from '../models/user-session.domain';

export const useAuthRedirects = () => {
  const localePath = useLocalePath();

  const redirectAuthenticated = (
    to: RouteLocationNormalizedGeneric,
    _from: RouteLocationNormalizedGeneric,
    user: LoggedInUser,
  ) => {
    const requiredPermissions = to.meta.requiredPermissions;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return;
    }

    const userPermissionNames = user.permissions;

    const userHasAllRequiredPermissions = requiredPermissions.every((required) =>
      userPermissionNames.includes(required as string),
    );

    if (!userHasAllRequiredPermissions) {
      return navigateTo(localePath('/'));
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
