import { Comment, Like, Post, User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

export function extractLikesData(doc: Post | Comment, user: User | null) {
  const profile = user?.profile;
  const likes = extractCollection(doc.likes?.docs);
  const likesCount = doc.likesCount ?? 0;

  const likesMap = new Map<string, Like>();
  let likeData: Like | null = null;

  for (const like of likes ?? []) {
    likesMap.set(like.id, like);
    if (
      profile &&
      like.createdBy.relationTo === profile.relationTo &&
      extractID(like.createdBy.value) === extractID(profile.value)
    ) {
      likeData = like;
    }
  }

  return { likesMap, likesCount, likeData, likes };
}

export function extractLikesDataWorklet(doc: Post | Comment, profile: User['profile']) {
  'worklet';
  const likes = doc.likes?.docs
    ?.map((d) => (typeof d === 'string' ? null : d))
    .filter((d) => d !== null);

  const likesCount = doc.likesCount ?? 0;

  const likesMap = new Map<string, Like>();
  let likeData: Like | null = null;

  const extractID = (val: string | { id: string }) => {
    if (typeof val === 'string') return val;
    return val.id;
  };

  for (const like of likes ?? []) {
    likesMap.set(like.id, like);
    if (
      profile &&
      like.createdBy.relationTo === profile.relationTo &&
      extractID(like.createdBy.value) === extractID(profile.value)
    ) {
      likeData = like;
    }
  }

  return { likesMap, likesCount, likeData, likes };
}
