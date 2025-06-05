import { getUpdatedDonationStatus } from '@/lib/utils/collections/getUpdatedDonationStatus';
import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook } from 'payload';

export const updateMilkBag: CollectionAfterChangeHook<Request> = async ({ doc, req, context }) => {
  if (!doc.details?.bags || !context.updateMilkBag) {
    return doc;
  }

  req.payload.logger.info(
    {
      requestId: doc.id,
      bags: doc.details.bags.map((bag) => extractID(bag)),
    },
    'Updating milk bags for matched request'
  );

  const updatedMilkBags = await Promise.all(
    doc.details.bags.map(async (bag) => {
      return await req.payload.update({
        collection: 'milkBags',
        id: extractID(bag),
        data: { status: 'ALLOCATED' },
        req,
      });
    })
  );

  if (!doc.matchedDonation) return doc;

  const donation = await req.payload.findByID({
    collection: 'donations',
    id: extractID(doc.matchedDonation),
    depth: 0,
    req,
    select: { status: true, volume: true, remainingVolume: true },
  });

  const { remainingVolume, status } = getUpdatedDonationStatus(updatedMilkBags, donation.status);

  if (status !== donation.status || remainingVolume !== donation.remainingVolume) {
    req.payload.logger.info(
      {
        donationId: donation.id,
        updatedStatus: status,
        remainingVolume,
      },
      'Updating donation status and volumes'
    );

    req.context.skipDonationUpdateHook = true; // Prevent infinite loop in hooks
    await req.payload.update({
      collection: 'donations',
      id: donation.id,
      data: {
        status,
        remainingVolume,
      },
      req,
    });
  }

  return doc;
};
