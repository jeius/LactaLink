import { hookLogger } from '@lactalink/agents/payload';
import { CollectionWithAvatar } from '@lactalink/types/collections';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

/**
 * Deletes the previous avatar image when a new avatar is uploaded.
 *
 * @param doc - The current document being processed, which includes the new avatar reference.
 * @param previousDoc - The previous version of the document, which includes the old avatar reference.
 * @param req - The Payload request object, used to perform the delete operation.
 * @param logger - Optional logger for logging the deletion process.
 *
 * @throws Will throw an error if the delete operation fails.
 */
export async function deletePreviousAvatar(
  doc: CollectionWithAvatar,
  previousDoc: CollectionWithAvatar,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  // This hook is intended to delete the previous avatar image
  // when a new avatar is uploaded.
  const prevAvatar = previousDoc.avatar;
  const newAvatar = doc.avatar;

  const prevAvatarID = prevAvatar ? extractID(prevAvatar) : null;
  const newAvatarID = newAvatar ? extractID(newAvatar) : null;

  if (prevAvatarID && prevAvatarID !== newAvatarID) {
    await req.payload.delete({
      collection: 'avatars',
      id: prevAvatarID,
      req,
    });
    logger?.info(`Deleted previous avatar with ID: ${prevAvatarID} for document ID: ${doc.id}`);
  }
}
