import { useUserSessionStore } from '#layers/auth/app/store/user-session.store';

export default defineNuxtRouteMiddleware((to) => {
  const { $pinia } = useNuxtApp();
  const sessionStore = useUserSessionStore($pinia);
  const localePath = useLocalePath();

  if (sessionStore.isAuthenticated) {
    return;
  }

  const loginPath = String(localePath('/login'));
  const target = `${loginPath}?redirect=${encodeURIComponent(to.fullPath)}`;
  return navigateTo(target);
});
