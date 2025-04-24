import { signOut } from '@/auth/operations/signOut';
import { User } from '@lactalink/types';
import { CollectionAfterLogoutHook } from 'payload';

export const supabaseSignOut: CollectionAfterLogoutHook<User> = async (args) => {
  await signOut();
  return args;
};
