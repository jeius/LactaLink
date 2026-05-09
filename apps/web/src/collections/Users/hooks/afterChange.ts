import { User } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

export const afterChange: CollectionAfterChangeHook<User> = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  if (operation === 'update') {
    // If the doc is soft-deleted, propagate soft-delete to profile
    if (previousDoc.deletedAt === null && doc.deletedAt !== null) {
      const profile = doc.profile;
      if (!profile) return doc;

      await req.payload.update({
        collection: profile.relationTo,
        id: extractID(profile.value),
        data: { deletedAt: doc.deletedAt },
        trash: true,
      });
    }
  }

  return doc;
};
