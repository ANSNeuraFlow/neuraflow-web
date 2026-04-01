import type { Permission } from './layers/auth/app/models/user.domain';

declare module '#app' {
  interface PageMeta {
    title?: string;
    requiredPermissions?: Permission[];
  }
}

export {};
