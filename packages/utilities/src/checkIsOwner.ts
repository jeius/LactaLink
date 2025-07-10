import type { User } from '@lactalink/types';
import type { CollectionWithOwner } from '@lactalink/types/collections';
import { extractID } from './extractors';

export function checkIsOwner(user: string | User, collections: CollectionWithOwner[]): boolean {
  if (typeof user === 'string') {
    return collections.some((collection) => {
      if (collection.owner) {
        return extractID(collection.owner) === user;
      }
      return false;
    });
  }

  if (user?.id) {
    return collections.some((collection) => {
      if (collection.owner) {
        return extractID(collection.owner) === user.id;
      }
      return false;
    });
  }

  return false;
}
