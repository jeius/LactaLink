import { Comment } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

type Args = {
  req: PayloadRequest;
  doc: Comment;
  operation?: 'create' | 'update';
};

export async function updatePostCommentCount({ req, doc, operation }: Args): Promise<Comment> {
  // Only proceed if it's a top-level comment being created or deleted
  // if operation is update, we skip
  // If parent exists, it's a reply so we skip
  if (operation === 'update' || doc.parent) return doc;

  const postID = extractID(doc.post);
  try {
    const comments = await req.payload.count({
      collection: 'comments',
      req: req,
      where: {
        and: [{ post: { equals: postID } }, { parent: { exists: false } }],
      },
    });

    const count = comments.totalDocs;

    await req.payload.update({
      collection: 'posts',
      id: postID,
      data: { commentsCount: count },
      req: req,
    });
  } catch (error) {
    req.payload.logger.error(
      {
        docID: doc.id,
        postID: postID,
        error: error,
        message: extractErrorMessage(error),
      },
      `Failed to update post comments count after comment created.`
    );
  }

  return doc;
}

export async function updateCommentRepliesCount({ req, doc, operation }: Args): Promise<Comment> {
  // Only proceed if it's a reply being created or deleted
  // if operation is update, we skip
  // if no parent, it's a top-level comment so we skip
  if (operation === 'update' || !doc.parent) return doc;

  const postID = extractID(doc.post);
  const parentID = extractID(doc.parent);
  try {
    const comments = await req.payload.count({
      collection: 'comments',
      req: req,
      where: {
        and: [{ post: { equals: postID } }, { parent: { equals: parentID } }],
      },
    });

    const count = comments.totalDocs;

    await req.payload.update({
      collection: 'comments',
      id: parentID,
      data: { repliesCount: count },
      req: req,
    });
  } catch (error) {
    req.payload.logger.error(
      {
        docID: doc.id,
        postID: postID,
        parentID: parentID,
        error: error,
        message: extractErrorMessage(error),
      },
      `Failed to update parent comment replies count after reply created.`
    );
  }

  return doc;
}
