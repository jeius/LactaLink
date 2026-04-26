import { Comment, Like, Post, User } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection } from '@lactalink/utilities/extractors';

export function extractLikesData(doc: Post | Comment, user: User | null) {
  const profile = user?.profile;
  const likes = extractCollection(doc.likes?.docs);
  const likesCount = doc.likesCount ?? 0;

  let likeData: Like | null = null;

  for (const like of likes ?? []) {
    if (profile && isEqualProfiles(like.createdBy, profile)) {
      likeData = like;
    }
  }

  return { likesCount, likeData };
}
