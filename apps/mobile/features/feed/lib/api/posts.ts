import { getApiClient } from '@/lib/services';
import { getMeUser } from '@/lib/stores/meUserStore';
import { extractID } from '@lactalink/utilities/extractors';

export async function getPublishedPosts(
  { page, limit = 15 }: { page: number; limit?: number },
  init?: RequestInit
) {
  const meUser = getMeUser();
  const meProfile = meUser?.profile;

  return getApiClient().find(
    {
      collection: 'posts',
      page: page,
      limit: limit,
      sort: '-createdAt',
      depth: 2,
      pagination: true,
      where: { status: { equals: 'PUBLISHED' } },
      populate: { likes: { createdBy: true } },
      joins: {
        comments: false,
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
    },
    init
  );
}

export async function getPostByID(id: string, init?: RequestInit) {
  const meUser = getMeUser();
  const meProfile = meUser?.profile;

  return getApiClient().findByID(
    {
      collection: 'posts',
      id,
      depth: 2,
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
    },
    init
  );
}
