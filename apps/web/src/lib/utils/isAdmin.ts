import { User } from '@lactalink/types/payload-generated-types';

export function isAdmin(user: User | null): boolean {
  if (!user) {
    return false; // If user is null, they are not an admin
  }

  // Check if the user's role is 'ADMIN'
  return user.role === 'ADMIN';
}
