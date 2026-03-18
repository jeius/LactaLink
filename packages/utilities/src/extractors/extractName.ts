import { User } from '@lactalink/types/payload-generated-types';

/**
 *
 *
 * @param user The user object from which to extract the name.
 * @returns The extracted name from the user profile, or null if not found.
 */
export function extractName(user: Pick<User, 'profile'>): string | null {
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

/**
 * Extracts the display name from a user's profile.
 *
 * @param user - The user object from which to extract the display name.
 * @returns The extracted display name from the user profile.
 * @throws Throws an error if the user profile is not found or is in an unexpected format.
 */
export function extractDisplayName(user: Pick<User, 'profile'>): string {
  if (!user.profile) {
    throw new Error('User profile is not found.');
  }

  const profile = user.profile.value;

  if (typeof profile === 'string') {
    throw new Error('User profile is a string, expected an object.');
  }

  const displayName = profile.displayName;

  if (!displayName) {
    if ('givenName' in profile) {
      return profile.givenName;
    } else {
      return profile.name;
    }
  }

  return displayName;
}
