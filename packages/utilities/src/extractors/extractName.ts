import { User } from '@lactalink/types';

/**
 *
 *
 * @param user - The user object from which to extract the name.
 * @returns {string | null} - The extracted name from the user profile, or null if not found.
 */
export function extractName(user: User): string | null {
  if (user.profile) {
    const profile = user.profile.value;
    if (typeof profile === 'object') {
      if ('name' in profile) {
        return profile.name;
      } else {
        return profile.givenName.split(' ')[0] || null;
      }
    }
  }
  return null;
}
