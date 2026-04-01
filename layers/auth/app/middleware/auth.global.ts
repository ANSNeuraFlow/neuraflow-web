import { useAuthRedirects } from '../composables/useAuthRedirects';
import { useUserSessionStore } from '../store/user-session.store';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $pinia } = useNuxtApp();

  const sessionStore = useUserSessionStore($pinia);
  const { redirectAuthenticated, redirectUnauthenticated } = useAuthRedirects();

  if (sessionStore.isAuthenticated) {
    return redirectAuthenticated(to, from, sessionStore.session!);
  }

  return redirectUnauthenticated(to, from);
});
