import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineNuxtConfig } from 'nuxt/config';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  routeRules: {
    '/minigames': { redirect: { to: '/mind-exercises', statusCode: 301 } },
    '/minigames/': { redirect: { to: '/mind-exercises', statusCode: 301 } },
    '/minigames/slide-block': { redirect: { to: '/mind-exercises/slide-block', statusCode: 301 } },
    '/minigames/slide-block/': { redirect: { to: '/mind-exercises/slide-block', statusCode: 301 } },
    '/minigames/bci-dino': { redirect: { to: '/mind-exercises/slide-block', statusCode: 301 } },
    '/minigames/bci-dino/': { redirect: { to: '/mind-exercises/slide-block', statusCode: 301 } },
    '/minigames/przesun-klocek': { redirect: { to: '/mind-exercises/slide-block', statusCode: 301 } },
    '/minigames/przesun-klocek/': { redirect: { to: '/mind-exercises/slide-block', statusCode: 301 } },
  },
  components: [
    {
      path: resolve(currentDir, 'app/components'),
      pathPrefix: false,
      extensions: ['.vue'],
    },
  ],
});
