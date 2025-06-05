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

  const now = new Date();
  if (doc.expiresAt && new Date(doc.expiresAt) < now) {
    doc.status = 'EXPIRED';

    req.payload.logger.info(
      { milkBagId: doc.id, expiresAt: doc.expiresAt },
      'Updating milk bag status to EXPIRED due to expiry date'
    );

    // Persist to database
    req.context.skipUpdateExpireStatus = true;
    await req.payload.update({
      collection: 'milkBags',
      id: doc.id,
      data: { status: 'EXPIRED' },
      req,
    });
  }

  return doc;
};
