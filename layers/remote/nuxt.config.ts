import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineNuxtConfig } from 'nuxt/config';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  routeRules: {
    '/remote/game': { redirect: { to: '/movement-exercises/slide-block', statusCode: 302 } },
    '/remote/game/': { redirect: { to: '/movement-exercises/slide-block', statusCode: 302 } },
    '/drone': { redirect: { to: '/remote', statusCode: 302 } },
    '/drone/': { redirect: { to: '/remote', statusCode: 302 } },
    '/drone/eeg': { redirect: { to: '/remote', statusCode: 302 } },
    '/drone/eeg/': { redirect: { to: '/remote', statusCode: 302 } },
    '/remote/eeg': { redirect: { to: '/remote', statusCode: 302 } },
    '/remote/eeg/': { redirect: { to: '/remote', statusCode: 302 } },
    '/remote/drone/bci': { redirect: { to: '/remote/drone', statusCode: 302 } },
    '/remote/drone/bci/': { redirect: { to: '/remote/drone', statusCode: 302 } },
    '/remote/drone/manual': { redirect: { to: '/remote/drone', statusCode: 302 } },
    '/remote/drone/manual/': { redirect: { to: '/remote/drone', statusCode: 302 } },
    '/remote/drone/keyboard': { redirect: { to: '/remote/drone', statusCode: 302 } },
    '/remote/drone/keyboard/': { redirect: { to: '/remote/drone', statusCode: 302 } },
  },
  components: [
    {
      path: resolve(currentDir, 'app/components'),
      pathPrefix: false,
      extensions: ['.vue'],
    },
  ],
});
