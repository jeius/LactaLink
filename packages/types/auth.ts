import { SanitizedPermissions } from 'payload';
import { User } from './payload-types';

export type SignInResult =
  | {
      exp: number;
      token: string;
      user: User;
      permissions: SanitizedPermissions;
    }
  | { user: null };
