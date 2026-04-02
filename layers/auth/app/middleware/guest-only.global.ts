import { useUserSessionStore } from '../store/user-session.store';

const GUEST_ROUTES = new Set(['/login', '/register']);

export default defineNuxtRouteMiddleware((to) => {
  const { $pinia } = useNuxtApp();
  const sessionStore = useUserSessionStore($pinia);
  const localePath = useLocalePath();

  if (!sessionStore.isAuthenticated) {
    return;
  }

  if (!GUEST_ROUTES.has(to.path)) {
    return;
  }

  return navigateTo(localePath('/'));
});
