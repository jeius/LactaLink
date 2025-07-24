import { MilkBag } from '@lactalink/types';
import { CollectionBeforeReadHook } from 'payload';

export const updateExpireStatus: CollectionBeforeReadHook<MilkBag> = async ({
  doc,
  req,
  context,
}) => {
  // If the document is already expired, no need to check again
  if (doc.status === 'EXPIRED' || context.skipUpdateExpireStatus) {
    return doc;
  }

  // Only check if expiresAt exists and status allows expiration
  if (!doc.expiresAt || !['AVAILABLE', 'ALLOCATED'].includes(doc.status)) {
    return doc;
  }

  const now = new Date();
  const expiryDate = new Date(doc.expiresAt);

  if (expiryDate < now) {
    doc.status = 'EXPIRED';

    req.payload.logger.info(
      { milkBagId: doc.id, expiresAt: doc.expiresAt },
      'Updating milk bag status to EXPIRED due to expiry date'
    );

    // Persist to database - use try/catch to handle potential errors
    try {
      req.context.skipUpdateExpireStatus = true;

      await req.payload.update({
        collection: 'milkBags',
        id: doc.id,
        data: { status: 'EXPIRED' },
        req,
      });
    } catch (error) {
      req.payload.logger.error(
        {
          milkBagId: doc.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to update milk bag status to EXPIRED'
      );
      // Don't throw error to avoid breaking the read operation
    }
  }

  return doc;
};
