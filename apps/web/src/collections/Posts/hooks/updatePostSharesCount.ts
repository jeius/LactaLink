import { Post } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

type Args = {
  req: PayloadRequest;
  doc: Post;
  operation?: 'create' | 'update';
};

export async function updatePostSharesCount({ req, doc, operation }: Args): Promise<Post> {
  // Only proceed if it's a shared post being created or deleted
  if (operation === 'update' || !doc.sharedFrom) return doc;

  const originalPostID = extractID(doc.sharedFrom.value);
  const collection = doc.sharedFrom.relationTo;

  if (collection !== 'posts') {
    // We only handle shares of posts yet, so if it's not a post, we skip
    return doc;
  }

  try {
    const shares = await req.payload.count({
      collection: collection,
      req: req,
      where: {
        and: [{ sharedFrom: { equals: originalPostID } }, { deletedAt: { exists: false } }],
      },
    });
    const count = shares.totalDocs;

    await req.payload.update({
      collection: 'posts',
      id: originalPostID,
      data: { sharesCount: count },
      req: req,
    });
  } catch (error) {
    req.payload.logger.error(
      {
        docID: doc.id,
        originalPostID: originalPostID,
        error: error,
        message: extractErrorMessage(error),
      },
      `Failed to update original post's shares count after shared post created.`
    );
  }

  return doc;
}
