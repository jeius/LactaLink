import { getMeUser } from '@/lib/stores/meUserStore';
import { Comment, Like, Post } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

export function extractLikesData(doc: Post | Comment) {
  const user = getMeUser();
  const userProfile = user?.profile;

  const likes = extractCollection(doc.likes?.docs);
  const likesCount = doc.likes?.totalDocs ?? 0;

  const likesMap = new Map<string, Like>();
  let likeData: Like | null = null;

  for (const like of likes ?? []) {
    likesMap.set(like.id, like);
    if (
      userProfile &&
      like.createdBy.relationTo === userProfile.relationTo &&
      extractID(like.createdBy.value) === extractID(userProfile.value)
    ) {
      likeData = like;
    }
  }

  return { likesMap, likesCount, likeData, likes };
}
