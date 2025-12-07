import { CollectionBeforeDeleteHook, CollectionSlug } from 'payload';

export const deleteRelatedDocs: CollectionBeforeDeleteHook = async ({ req, id }) => {
  // Define related collections to delete documents from
  const slugsToDelete: CollectionSlug[] = ['likes', 'comments'];

  const deletePromises = slugsToDelete.map((slug) =>
    req.payload.delete({
      collection: slug,
      where:
        slug === 'likes'
          ? {
              and: [{ 'liked.value': { equals: id } }, { 'liked.relationTo': { equals: 'posts' } }],
            }
          : { post: { equals: id } },
      req,
    })
  );

  const [deletedLikes, deletedComments] = await Promise.all(deletePromises);

  req.payload.logger.info(
    {
      likes: deletedLikes?.docs.length || 0,
      comments: deletedComments?.docs.length || 0,
    },
    `Deleted related documents for post ${id}`
  );
};
