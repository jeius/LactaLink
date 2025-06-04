import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const updateMilkBag: CollectionAfterChangeHook<Request> = async ({
  doc,
  operation,
  req,
  context,
}) => {
  // Only proceed if the status is MATCHED, and there are milk bags
  if (doc.status !== 'MATCHED' || !doc.details?.bags) {
    return doc;
  }

  // Ensure that the context has the updateMilkBag flag set
  if (context.updateMilkBag) {
    req.payload.logger.info(
      {
        requestId: doc.id,
        bags: doc.details.bags.map((bag) => extractID(bag)),
      },
      'Updating milk bags for matched request'
    );

    // Set a flag in the context to prevent nested hooks
    context.skipDonationUpdate = true;

    await Promise.all(
      doc.details.bags.map(async (bag) => {
        await req.payload.update({
          collection: 'milkBags',
          id: extractID(bag),
          data: { status: 'ALLOCATED' },
          req,
        });
      })
    );
  }

  return doc;
};
