import type { SanitizedPermissions } from 'payload';
import { User } from './payload-types';

export type AuthResult = {
  exp?: number;
  token?: string;
  user: User | null;
  permissions?: SanitizedPermissions;
  message?: string;
  collection?: 'users' | 'admins';
  error?: object;
};
