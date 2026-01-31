import { User } from '@lactalink/types/payload-generated-types';
import { extractID } from '../extractors/extractID';
import { Options } from './types';

/**
 * Compares two user profiles for equality based on their IDs and relation.
 * @param profileA - first user profile
 * @param profileB - second user profile
 *  @param options - additional options
 * @returns true if profiles are equal, false otherwise
 */
export function isEqualProfiles(
  profileA: User['profile'],
  profileB: User['profile'],
  options: Options = {}
): boolean {
  const { debug = false } = options;

  if (debug) {
    console.log('Comparing profiles:', { profileA, profileB });
  }

  if (!profileA) {
    if (debug) {
      console.error('Error in isEqualProfiles: profileA is undefined or null');
    }
    return false;
  }

  if (!profileB) {
    if (debug) {
      console.error('Error in isEqualProfiles: profileB is undefined or null');
    }
    return false;
  }

  return (
    profileA.relationTo === profileB.relationTo &&
    extractID(profileA.value) === extractID(profileB.value)
  );
}
