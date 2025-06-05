import { getUpdatedDonationStatus } from '@/lib/utils/collections/getUpdatedDonationStatus';
import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeChangeHook } from 'payload';

export const updateStatus: CollectionBeforeChangeHook<Donation> = async ({
  data,
  req,
  context,
  operation,
}) => {
  // Check if the context has the skipDonationUpdate flag
  if (context.skipDonationUpdateHook || operation !== 'update') {
    req.payload.logger.info(
      { donationId: data.id },
      'Skipping donation status update due to context flag'
    );
    return data;
  }

  if (!data?.details?.bags || data.details.bags.length === 0) {
    req.payload.logger.warn(
      { donationId: data.id },
      'No milk bags found for this donation, skipping status update'
    );
    return data; // No bags to process, return the original document
  }

  req.payload.logger.info(
    { donationId: data.id, bagsCount: data.details.bags.length },
    'Updating donation status based on milk bags'
  );

  const milkBags = await Promise.all(
    data.details.bags.map((bag) => {
      return req.payload.findByID({
        collection: 'milkBags',
        id: extractID(bag),
        depth: 0,
        req,
      });
    })
  );

  const { volume, remainingVolume, status } = getUpdatedDonationStatus(milkBags, data.status);

  // Only update the database if there are changes to status, volume, or remainingVolume
  if (
    status !== data.status ||
    volume !== data.volume ||
    remainingVolume !== data.remainingVolume
  ) {
    req.payload.logger.info(
      {
        donationId: data.id,
        updatedStatus: status,
        totalVolume: volume,
        remainingVolume,
      },
      'Updating donation status and volumes'
    );

    data.status = status;
    data.volume = volume;
    data.remainingVolume = remainingVolume;
  }

  return data;
};
