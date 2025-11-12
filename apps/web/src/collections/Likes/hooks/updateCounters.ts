import { Like } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload';

const updateCount = async (doc: Like['liked'], req: PayloadRequest) => {
  const collection = doc.relationTo;
  const id = extractID(doc.value);

  const { totalDocs } = await req.payload.count({
    collection: 'likes',
    req,
    where: {
      and: [{ 'liked.value': { equals: id } }, { 'liked.relationTo': { equals: collection } }],
    },
  });

  await req.payload.update({ req, collection, id, data: { likesCount: totalDocs } });
};

export const updateDocLikesCount: CollectionAfterChangeHook<Like> = async ({ doc, req }) => {
  await updateCount(doc.liked, req);
  return doc;
};

export const deleteDocLikesCount: CollectionAfterDeleteHook<Like> = async ({ doc, req }) => {
  await updateCount(doc.liked, req);
  return doc;
};
