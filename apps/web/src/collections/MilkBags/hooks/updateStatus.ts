import { MilkBag } from '@lactalink/types';
import { CollectionBeforeReadHook } from 'payload';

export const updateExpireStatus: CollectionBeforeReadHook<MilkBag> = async ({
  doc,
  req,
  context,
}) => {
  // If the document is already expired, no need to check again
  if (doc.status === 'EXPIRED') {
    return doc;
  }

  const now = new Date();
  if (doc.expiresAt && new Date(doc.expiresAt) < now) {
    doc.status = 'EXPIRED';
    context.skipDonationUpdate = true;

    req.payload.logger.info(
      { milkBagId: doc.id, expiresAt: doc.expiresAt },
      'Updating milk bag status to EXPIRED due to expiry date'
    );

    // Persist to database
    await req.payload.update({
      collection: 'milkBags',
      id: doc.id,
      data: { status: 'EXPIRED' },
      req,
    });
  }

  return doc;
};
