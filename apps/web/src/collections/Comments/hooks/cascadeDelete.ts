import { CollectionBeforeDeleteHook } from 'payload';

export const cascadeDeleteComments: CollectionBeforeDeleteHook = async ({ req, id }) => {
  // Delete all replies associated with the comment being deleted
  const deletedComments = await req.payload.delete({
    collection: 'comments',
    where: { parent: { equals: id } },
    overrideAccess: true,
    depth: 0,
    req,
  });

  req.payload.logger.info(
    `Cascade deleted ${deletedComments.docs.length} replies for comment ID: ${id}`
  );

  // Delete all likes associated with the comment being deleted
  const deletedLikes = await req.payload.delete({
    collection: 'likes',
    where: {
      and: [{ 'liked.relationTo': { equals: 'comments' } }, { 'liked.value': { equals: id } }],
    },
    overrideAccess: true,
    depth: 0,
    req,
  });

  req.payload.logger.info(
    `Cascade deleted ${deletedLikes.docs.length} likes for comment ID: ${id}`
  );
};
