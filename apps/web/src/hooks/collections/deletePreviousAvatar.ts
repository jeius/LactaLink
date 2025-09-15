import { CollectionWithAvatar } from '@lactalink/types/collections';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

export const deletePreviousAvatar: CollectionAfterChangeHook<CollectionWithAvatar> = async ({
  previousDoc,
  doc,
  req,
}) => {
  // This hook is intended to delete the previous avatar image
  // when a new avatar is uploaded.
  const prevAvatar = previousDoc.avatar;
  const newAvatar = doc.avatar;

  const prevAvatarID = prevAvatar ? extractID(prevAvatar) : null;
  const newAvatarID = newAvatar ? extractID(newAvatar) : null;

  if (prevAvatarID && newAvatarID && prevAvatarID !== newAvatarID) {
    await req.payload.delete({
      collection: 'avatars',
      id: prevAvatarID,
      req,
    });
  }

  return doc;
};
