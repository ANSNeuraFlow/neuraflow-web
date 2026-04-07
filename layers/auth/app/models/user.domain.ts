export const PERMISSIONS = {
  VIEW_ADMIN_PANEL: 'VIEW_ADMIN_PANEL',
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  ROLES_READ: 'roles:read',
  ROLES_WRITE: 'roles:write',
  CLUSTERS_READ: 'clusters:read',
  CLUSTERS_WRITE: 'clusters:write',
  AUDIT_READ: 'audit:read',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  permissions: Permission[];
};

export type PublicUser = Omit<User, 'lastName' | 'permissions'>;
