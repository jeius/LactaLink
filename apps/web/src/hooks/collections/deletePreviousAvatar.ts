import { CollectionWithAvatar } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const deletePreviousAvatar: CollectionAfterChangeHook<CollectionWithAvatar> = async ({
  previousDoc,
  doc,
  req,
}) => {
  // This hook is intended to delete the previous avatar image
  // when a new avatar is uploaded.
  const { avatar } = previousDoc;

  if (avatar) {
    await req.payload.delete({
      collection: 'avatars',
      id: extractID(avatar),
      req,
    });
  }

  return doc;
};
