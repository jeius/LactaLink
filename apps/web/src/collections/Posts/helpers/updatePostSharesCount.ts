import { hookLogger } from '@lactalink/agents/payload';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

/**
 * Updates the `sharesCount` field on the original post when a new share is created.
 *
 * @description
 * This function is called from the `afterChange` hook on the `posts` collection.
 * It counts all existing shares of the original post and writes the total back to
 * the original post's `sharesCount` field. Only runs on `create` operations for
 * posts that have a `sharedFrom` relation pointing to another post.
 *
 * @param req - The Payload request object used for database operations and logging.
 * @param doc - The newly created or updated post document.
 * @param operation - The operation type (`'create'` or `'update'`). Only `'create'` is processed.
 * @param logger - Optional scoped logger from `hookLogger`. Falls back to a new instance if not provided.
 *
 * @returns The original `doc` unchanged.
 */
export async function updatePostSharesCount({
  req,
  doc,
  operation,
  logger,
}: {
  req: PayloadRequest;
  doc: Post;
  operation?: 'create' | 'update';
  logger?: ReturnType<typeof hookLogger>;
}): Promise<Post> {
  // Only proceed if it's a shared post being created
  if (operation === 'update' || !doc.sharedFrom) return doc;

  const originalPostID = extractID(doc.sharedFrom.value);
  const collection = doc.sharedFrom.relationTo;

  // Only handle shares of posts for now
  if (collection !== 'posts') return doc;

  try {
    const shares = await req.payload.count({
      collection,
      req,
      where: {
        and: [{ sharedFrom: { equals: originalPostID } }, { deletedAt: { exists: false } }],
      },
    });

    await req.payload.update({
      collection: 'posts',
      id: originalPostID,
      data: { sharesCount: shares.totalDocs },
      req,
    });
  } catch (error) {
    logger?.error(
      { docID: doc.id, originalPostID, cause: error, message: extractErrorMessage(error) },
      `Failed to update original post's shares count after shared post created.`
    );
  }

  return doc;
}
