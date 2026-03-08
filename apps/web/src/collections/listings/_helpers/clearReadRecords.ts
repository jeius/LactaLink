import { hookLogger } from '@lactalink/agents/payload';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { PayloadRequest, SanitizedCollectionConfig } from 'payload';

/**
 * Deletes read tracking records for a donation or request.
 *
 * @param doc - The donation or request document for which to clear read records.
 * @param req - The Payload request object, used to perform the delete operation on the read tracking collection.
 * @param collection - The collection configuration for the donation or request, used to determine which read tracking collection to target.
 * @param logger - Optional logger for logging the operation result. If provided, logs the number of deleted read tracking records.
 *
 * @return A promise that resolves to the deleted read tracking records, or null if an error occurred during the delete operation.
 *
 * @example
 * ```ts
 * // Example usage within a hook:
 * import { clearReadRecords } from '@/lib/utils/donationOrRequest/clearReadRecords';
 *
 * export const cleanReadTrackingOnUpdate: CollectionAfterChangeHook<Donation | Request> = async ({
 *   req,
 *   doc,
 *   collection,
 *   operation,
 * }) => {
 *   // Only clean read tracking on update operations
 *  if (operation !== 'update') return doc;
 *  const logger = hookLogger(req, collection.slug, 'afterChange')
 *  await clearReadRecords(doc, req, collection, logger);
 *  return doc;
 * };
 * ```
 */
export async function clearReadRecords(
  doc: Donation | Request,
  req: PayloadRequest,
  collection: SanitizedCollectionConfig,
  logger?: ReturnType<typeof hookLogger>
) {
  const readCollection = collection.slug === 'donations' ? 'donation-reads' : 'request-reads';
  const entityField = collection.slug === 'donations' ? 'donation' : 'request';

  try {
    // Delete all read tracking records
    const { docs } = await req.payload.delete({
      collection: readCollection,
      where: { [entityField]: { equals: doc.id } },
      depth: 0,
      req,
    });

    logger?.info(`Cleaned ${docs.length} read tracking records for ${collection.labels.singular}`);

    return docs;
  } catch (error) {
    req.payload.logger.warn(
      `Failed to clean read tracking records for ${collection.slug} ${doc.id}: ${error}`
    );
    return null;
  }
}
