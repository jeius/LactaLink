import { User } from '@lactalink/types/payload-generated-types';
import { extractID } from '../extractors/extractID';

/**
 * Compares two user profiles for equality based on their IDs and relation.
 * @param profileA - first user profile
 * @param profileB - second user profile
 * @returns true if profiles are equal, false otherwise
 */
export function isEqualProfiles(profileA?: User['profile'], profileB?: User['profile']) {
  if (!profileA) {
    console.error('Error in isEqualProfiles: profileA is undefined or null');
    return false;
  }
  if (!profileB) {
    console.error('Error in isEqualProfiles: profileB is undefined or null');
    return false;
  }
  return (
    profileA.relationTo === profileB.relationTo &&
    extractID(profileA.value) === extractID(profileB.value)
  );
}
