import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineNuxtConfig } from 'nuxt/config';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  routeRules: {
    '/mind-exercises': { redirect: { to: '/movement-exercises', statusCode: 301 } },
    '/mind-exercises/': { redirect: { to: '/movement-exercises', statusCode: 301 } },
    '/mind-exercises/slide-block': { redirect: { to: '/movement-exercises/slide-block', statusCode: 301 } },
    '/mind-exercises/slide-block/': { redirect: { to: '/movement-exercises/slide-block', statusCode: 301 } },
    '/mind-exercises/neuro-balance': { redirect: { to: '/movement-exercises/neuro-balance', statusCode: 301 } },
    '/mind-exercises/neuro-balance/': { redirect: { to: '/movement-exercises/neuro-balance', statusCode: 301 } },
    '/mind-exercises/forward-gate': { redirect: { to: '/movement-exercises/forward-gate', statusCode: 301 } },
    '/mind-exercises/forward-gate/': { redirect: { to: '/movement-exercises/forward-gate', statusCode: 301 } },
  },
  components: [
    {
      path: resolve(currentDir, 'app/components'),
      pathPrefix: false,
      extensions: ['.vue'],
    },
  ],
});
