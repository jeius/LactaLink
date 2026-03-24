import { getMeUser } from '@/lib/stores/meUserStore';
import { UserProfile } from '@lactalink/types';
import { User } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractID } from '@lactalink/utilities/extractors';

/**
 * Checks if the given user (or user ID) matches the currently authenticated user.
 * @param user - The user or user ID to compare against the authenticated user.
 * @returns True if the given user is the authenticated user, false otherwise.
 * @throws If there is no authenticated user.
 */
export function isMeUser(user: string | Pick<User, 'id'>): boolean {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User not logged in!');
  return extractID(meUser) === extractID(user);
}

/**
 * Checks if the given user profile belongs to the currently authenticated user.
 * @param userProfile - The user profile to compare against the authenticated user's profile.
 * @returns True if the given profile belongs to the authenticated user, false otherwise.
 * @throws If there is no authenticated user or if the authenticated user has no profile.
 */
export function isMeProfile(userProfile: UserProfile): boolean {
  const meUser = getMeUser();

  if (!meUser) throw new Error('User not logged in!');

  const meProfile = meUser.profile;
  if (!meProfile) throw new Error('Me user has no profile!');

  return isEqualProfiles(meProfile, userProfile);
}
