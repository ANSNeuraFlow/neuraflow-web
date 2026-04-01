export const PERMISSIONS = {
  VIEW_ADMIN_PANEL: 'VIEW_ADMIN_PANEL',
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
