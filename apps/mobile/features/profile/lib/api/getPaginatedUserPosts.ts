import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { UserProfile } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';

export function getPaginatedUserPosts(profile: UserProfile, page: number) {
  const meUser = getMeUser();
  const meProfile = meUser?.profile;

  return getApiClient().find({
    collection: 'posts',
    pagination: true,
    page: page,
    limit: 10,
    where: {
      and: [
        { 'author.relationTo': { equals: profile.relationTo } },
        { 'author.value': { equals: extractID(profile.value) } },
      ],
    },
    joins: {
      comments: { count: true, limit: 10 },
      shares: false,
      likes: !meProfile
        ? false
        : {
            count: true,
            where: {
              and: [
                { 'createdBy.relationTo': { equals: meProfile.relationTo } },
                { 'createdBy.value': { equals: extractID(meProfile.value) } },
              ],
            },
          },
    },
  });
}
