import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook } from 'payload';

/**
 * Hook to delete read tracking records when donations or requests are updated,
 * since the content has changed and users should see it as "unread" again
 */
export const cleanReadTrackingOnUpdate: CollectionAfterChangeHook<Donation | Request> = async ({
  req,
  doc,
  collection,
  operation,
}) => {
  // Only clean read tracking on update operations
  if (operation !== 'update') return doc;

  const readCollection = collection.slug === 'donations' ? 'donation-reads' : 'request-reads';
  const entityField = collection.slug === 'donations' ? 'donation' : 'request';

  try {
    // Delete all read tracking records
    const readRecords = await req.payload.delete({
      collection: readCollection,
      where: { [entityField]: { equals: doc.id } },
      depth: 0,
      req,
    });

    req.payload.logger.info(
      {
        entityType: collection.slug,
        entityId: doc.id,
        deletedReadRecords: readRecords.docs.length,
      },
      `Cleaned read tracking records for updated ${collection.labels.singular}`
    );
  } catch (error) {
    req.payload.logger.warn(
      `Failed to clean read tracking records for ${collection.slug} ${doc.id}: ${error}`
    );
  }

  return doc;
};
