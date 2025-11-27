import { InfiniteDataMap } from '@/lib/types';
import { extractLikesData } from '@/lib/utils/extractLikesData';
import { Comment, Like, Post, User } from '@lactalink/types/payload-generated-types';
import { produce } from 'immer';

type LikableDocument = Post | Comment;

/**
 * Updates like data in the infinite query cache
 * Handles both adding and removing likes optimistically
 */
export function updateLikeInCache(
  oldData: InfiniteDataMap<LikableDocument> | undefined,
  documentId: string,
  likeData: Like,
  user: User | null,
  operation: 'add' | 'remove'
): InfiniteDataMap<LikableDocument> | undefined {
  if (!oldData) return oldData;

  return produce(oldData, (draft) => {
    // Find the page containing the document
    for (const page of draft.pages) {
      const document = page.docs.get(documentId);
      if (!document?.likes) continue;

      const { likesMap, likesCount } = extractLikesData(document, user);

      // Update the likes collection
      if (operation === 'remove') {
        likesMap.delete(likeData.id);
        updateLikesCount(document, Math.max(likesCount - 1, 0));
      } else {
        likesMap.set(likeData.id, likeData);
        updateLikesCount(document, likesCount + 1);
      }

      // Update the document's likes array
      document.likes.docs = Array.from(likesMap.values());

      // Force reactivity by recreating the Map
      page.docs = new Map(page.docs).set(documentId, document);
      break;
    }
  });
}

export function updatePostLikesInCache(
  oldData: Post | undefined,
  likeData: Like,
  user: User | null,
  operation: 'add' | 'remove'
): Post | undefined {
  if (!oldData || !oldData.likes) return oldData;

  return produce(oldData, (draft) => {
    if (!draft.likes) return;

    const { likesMap, likesCount } = extractLikesData(oldData, user);

    if (operation === 'remove') {
      likesMap.delete(likeData.id);
      updateLikesCount(draft, Math.max(likesCount - 1, 0));
    } else {
      likesMap.set(likeData.id, likeData);
      updateLikesCount(draft, likesCount + 1);
    }

    // Update the document's likes array
    draft.likes.docs = Array.from(likesMap.values());
  });
}

/**
 * Updates the likes count on a document
 */
function updateLikesCount(document: LikableDocument, count: number): void {
  if (!document.likes) return;

  document.likesCount = count;

  // Only update totalDocs if it exists in the response
  // (some queries may omit this when count = false)
  if ('totalDocs' in document.likes) {
    document.likes.totalDocs = count;
  }
}
