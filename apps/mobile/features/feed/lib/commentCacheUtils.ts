import { InfiniteDataMap } from '@/lib/types';
import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { produce } from 'immer';

/**
 * Adds a comment to the infinite query cache
 * Root comments are added to the beginning, replies to the end
 */
export function addCommentToCache(
  oldData: InfiniteDataMap<Comment> | undefined,
  newComment: Comment
): InfiniteDataMap<Comment> | undefined {
  if (!oldData) return oldData;

  return produce(oldData, (draft) => {
    // Reply: add to the end of the last page
    if (newComment.parent) {
      const lastPage = draft.pages.at(-1);
      if (!lastPage) return;

      lastPage.docs.set(newComment.id, newComment);
      lastPage.totalDocs += 1;
      return;
    }

    // Root comment: add to the beginning of the first page
    const firstPage = draft.pages[0];
    if (!firstPage) return;

    const comments = Array.from(firstPage.docs.values());
    comments.unshift(newComment);

    firstPage.docs = new Map(comments.map((c) => [c.id, c]));
    firstPage.totalDocs += 1;
  });
}

/**
 * Removes a comment from the infinite query cache
 */
export function removeCommentFromCache(
  oldData: InfiniteDataMap<Comment> | undefined,
  commentID: string
): InfiniteDataMap<Comment> | undefined {
  if (!oldData) return oldData;

  return produce(oldData, (draft) => {
    for (const page of draft.pages) {
      if (page.docs.has(commentID)) {
        page.docs.delete(commentID);
        page.totalDocs = Math.max(page.totalDocs - 1, 0);
        break;
      }
    }
  });
}

export function updatePostCommentsCountInCache(
  oldData: InfiniteDataMap<Post> | undefined,
  postID: string,
  type: 'increment' | 'decrement'
): InfiniteDataMap<Post> | undefined {
  if (!oldData) return oldData;
  return produce(oldData, (draft) => {
    for (const page of draft.pages) {
      const post = page.docs.get(postID);
      if (post) {
        post.commentsCount = updateCount(post.commentsCount, type);
        page.docs = new Map(page.docs).set(postID, post);
        break;
      }
    }
  });
}

export function updateCommentRepliesCountInCache(
  oldData: InfiniteDataMap<Comment> | undefined,
  commentID: string,
  type: 'increment' | 'decrement'
): InfiniteDataMap<Comment> | undefined {
  if (!oldData) return oldData;
  return produce(oldData, (draft) => {
    for (const page of draft.pages) {
      const comment = page.docs.get(commentID);
      if (comment) {
        comment.repliesCount = updateCount(comment.repliesCount, type);
        page.docs = new Map(page.docs).set(commentID, comment);
        break;
      }
    }
  });
}

// Helper to increment/decrement count based on operation
function updateCount(
  currentCount: number | undefined | null,
  operation: 'increment' | 'decrement'
): number {
  if (operation === 'increment') {
    return (currentCount || 0) + 1;
  } else {
    return Math.max((currentCount || 1) - 1, 0);
  }
}
