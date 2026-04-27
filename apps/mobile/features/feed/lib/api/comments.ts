import { getApiClient } from '@/lib/services';
import { getMeUser } from '@/lib/stores/meUserStore';
import { extractID } from '@lactalink/utilities/extractors';

type PaginationOptions = {
  page: number;
  limit?: number;
};

export function getPaginatedComments(
  { postID, page, limit = 10 }: { postID: string } & PaginationOptions,
  init?: RequestInit
) {
  const meUser = getMeUser();
  const meUserProfile = meUser?.profile;
  return getApiClient().find(
    {
      collection: 'comments',
      page,
      limit,
      sort: '-createdAt',
      depth: 2,
      pagination: true,
      where: {
        and: [{ post: { equals: postID } }, { parent: { exists: false } }],
      },
      populate: {
        likes: { createdBy: true },
      },
      joins: {
        replies: { count: true, sort: '-createdAt', limit: 10 },
        likes: !meUserProfile
          ? false
          : {
              count: true,
              limit: 0,
              where: {
                and: [
                  { 'createdBy.relationTo': { equals: meUserProfile.relationTo } },
                  { 'createdBy.value': { equals: extractID(meUserProfile.value) } },
                ],
              },
            },
      },
    },
    init
  );
}

export function getPaginatedReplies(
  { commentID, page, limit = 10 }: { commentID: string } & PaginationOptions,
  init?: RequestInit
) {
  const meUser = getMeUser();
  const meUserProfile = meUser?.profile;
  return getApiClient().find(
    {
      collection: 'comments',
      page: page,
      limit: limit,
      sort: 'createdAt',
      depth: 2,
      pagination: true,
      where: { parent: { equals: commentID } },
      populate: { likes: { createdBy: true } },
      joins: {
        replies: false,
        likes: !meUserProfile
          ? false
          : {
              count: true,
              limit: 0,
              where: {
                and: [
                  { 'createdBy.relationTo': { equals: meUserProfile.relationTo } },
                  { 'createdBy.value': { equals: extractID(meUserProfile.value) } },
                ],
              },
            },
      },
    },
    init
  );
}
