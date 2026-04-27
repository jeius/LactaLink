import { hookLogger } from '@lactalink/agents/payload';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

/**
 * After a post is updated, delete any images that were removed from the attachments array.
 * This prevents orphaned media records and saves storage space.
 *
 * @param doc - The updated post document.
 * @param previousDoc - The post document before the update.
 * @param req - The Payload request object.
 * @param logger - Optional logger for logging deletion events.
 */
export async function deleteOrphanedImages(
  doc: Post,
  previousDoc: Post | null,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  const previousAttachments = previousDoc?.attachments ?? [];
  const currentAttachments = doc.attachments ?? [];

  // Build a set of image IDs that are still present after the update
  const currentImageIDs = new Set(
    currentAttachments.map((a) => (a.image ? extractID(a.image) : null)).filter(Boolean)
  );

  // Find image IDs that existed before but are no longer in the attachments
  const orphanedIDs = previousAttachments
    .map((a) => (a.image ? extractID(a.image) : null))
    .filter((id): id is string => !!id && !currentImageIDs.has(id));

  if (orphanedIDs.length === 0) return;

  await Promise.all(
    orphanedIDs.map((id) =>
      req.payload.delete({
        collection: 'images',
        id,
        req,
        depth: 0,
      })
    )
  );

  logger?.info(`Deleted ${orphanedIDs.length} orphaned image(s) from post ${doc.id}`, {
    orphanedIDs,
  });
}
