import { getUpdatedDonationStatus } from '@/lib/utils/collections/getUpdatedDonationStatus';
import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeChangeHook } from 'payload';

export const initialize: CollectionBeforeChangeHook<Donation> = async ({
  data,
  req,
  operation,
}) => {
  if (!data.details || operation !== 'create') return data;

  const milkBags = await Promise.all(
    data.details.bags.map((bag) => {
      return req.payload.findByID({
        collection: 'milkBags',
        id: extractID(bag),
        depth: 0,
      });
    })
  );

  const { remainingVolume, status, volume } = getUpdatedDonationStatus(milkBags, data.status);

  data.volume = volume;
  data.remainingVolume = remainingVolume;
  data.status = status;

  return data;
};
