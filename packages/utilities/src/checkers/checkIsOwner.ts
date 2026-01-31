import type { CollectionWithOwner } from '@lactalink/types/collections';
import type { User } from '@lactalink/types/payload-generated-types';
import { extractID } from '../extractors';
import { Options } from './types';

/**
 * Checks if the given user is the owner of any of the provided collections.
 * @param user - user ID or `User` object
 * @param collections - array of collections to check ownership against
 * @param options - additional options
 * @returns `true` if the user is the owner of any collection, `false` otherwise
 */
export function checkIsOwner(
  user: string | User,
  collections: CollectionWithOwner[],
  options: Options = {}
): boolean {
  const { debug = false } = options;

  if (debug) {
    console.log('Checking ownership for user:', user);
    console.log('Collections to check:', collections.length);
  }

  if (typeof user === 'string') {
    return collections.some((collection) => {
      if (collection.owner) {
        return extractID(collection.owner) === user;
      }
      console.warn('Collection owner is undefined or null:', collection.id);
      return false;
    });
  }

  if (user?.id) {
    return collections.some((collection) => {
      if (collection.owner) {
        return extractID(collection.owner) === user.id;
      }
      console.warn('Collection owner is undefined or null:', collection.id);
      return false;
    });
  }

  return false;
}
