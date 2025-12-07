import { CollectionBeforeDeleteHook, CollectionSlug } from 'payload';

export const deleteRelatedDocs: CollectionBeforeDeleteHook = async ({ req, id }) => {
  // Define related collections to delete documents from
  const slugsToDelete: CollectionSlug[] = [
    'message-attachments',
    'message-reactions',
    'message-reads',
  ];

  const deletePromises = slugsToDelete.map((slug) =>
    req.payload.delete({
      collection: slug,
      where: { message: { equals: id } },
      req,
    })
  );

  const [deletedAttachments, deletedReactions, deletedReads] = await Promise.all(deletePromises);

  req.payload.logger.info(
    {
      attachments: deletedAttachments?.docs.length || 0,
      reactions: deletedReactions?.docs.length || 0,
      reads: deletedReads?.docs.length || 0,
    },
    `Deleted related documents for message ${id}`
  );
};
