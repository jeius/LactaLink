import { Like } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import status from 'http-status';
import { APIError, CollectionBeforeChangeHook } from 'payload';

export const ensureNoDuplicate: CollectionBeforeChangeHook<Like> = async ({
  data,
  req,
  collection,
}) => {
  const { liked } = data;
  const user = req.user;
  const profile = user?.profile;

  if (!liked || !profile) return data;

  const { totalDocs } = await req.payload.count({
    collection: collection.slug,
    where: {
      and: [
        { 'liked.relationTo': { equals: liked.relationTo } },
        { 'liked.value': { equals: extractID(liked.value) } },
        { 'createdBy.relationTo': { equals: profile.relationTo } },
        { 'createdBy.value': { equals: extractID(profile.value) } },
      ],
    },
  });

  if (totalDocs > 0) {
    throw new APIError(
      `You have already liked this ${liked.relationTo.slice(0, -1)}.`,
      status.CONFLICT,
      data,
      true
    );
  }

  return data;
};
