import { getApiClient } from '@/lib/services';
import { UserProfile } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';
import { LikableRelation } from '../types';

export async function createLike(
  { doc, userProfile }: { doc: LikableRelation; userProfile: UserProfile },
  init?: RequestInit
) {
  return getApiClient().create(
    {
      collection: 'likes',
      data: {
        liked: { relationTo: doc.relationTo, value: doc.value.id },
        createdBy: { relationTo: userProfile.relationTo, value: extractID(userProfile.value) },
      },
    },
    init
  );
}

export async function deleteLike(likeID: string, init?: RequestInit) {
  return getApiClient().deleteByID(
    {
      collection: 'likes',
      id: likeID,
    },
    init
  );
}
