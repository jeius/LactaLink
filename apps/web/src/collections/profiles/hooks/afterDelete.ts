import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterDeleteHook } from 'payload';

export const afterDelete: CollectionAfterDeleteHook<Hospital | Individual | MilkBank> = async ({
  req,
  doc,
}) => {
  // Delete associated avatar if it exists
  if (doc.avatar) {
    req.payload.delete({
      collection: 'avatars',
      id: extractID(doc.avatar),
      req,
    });
  }

  return doc;
};
