import type { User } from './user.domain';

export type UserSession = {
  id: string;
  expiresAt: string;
  signInIpAddress: string;
  lastIpAddress: string;
  signInUserAgent: string;
  lastUserAgent: string;
  firstAccessed: string;
  lastAccessed: string;
  user: User;
};
