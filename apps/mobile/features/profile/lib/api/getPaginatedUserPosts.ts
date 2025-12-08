import { getApiClient } from '@lactalink/api';
import { UserProfile } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';

export function getPaginatedUserPosts(profile: UserProfile, page: number) {
  const apiClient = getApiClient();

  return apiClient.find({
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
      comments: { count: true, limit: 0 },
      likes: { count: true, limit: 0 },
      shares: { count: true, limit: 0 },
    },
  });
}
