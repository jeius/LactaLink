import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeChangeHook } from 'payload';

export const initialize: CollectionBeforeChangeHook<Donation> = async ({
  data,
  req,
  operation,
}) => {
  if (!data.details || operation !== 'create') return data;

  const bagDocs = await Promise.all(
    data.details.bags.map((bag) => {
      return req.payload.findByID({
        collection: 'milkBags',
        id: extractID(bag),
        depth: 0,
      });
    })
  );

  const totalVolume = bagDocs.reduce((sum, bag) => sum + bag.volume, 0);
  const remainingVolume = bagDocs
    .filter((bag) => bag.status === 'AVAILABLE')
    .reduce((sum, bag) => sum + bag.volume, 0);

  data.volume = totalVolume;
  data.remainingVolume = remainingVolume;

  return data;
};
