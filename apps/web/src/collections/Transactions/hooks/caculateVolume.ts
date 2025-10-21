import { MilkBag, Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

/**
 * Hook to calculate the total volume of matched milk bags for a transaction.
 *
 * This hook is executed before reading a transaction document. It calculates
 * the `matchedVolume` property based on the `matchedBags` field in the document.
 * If no `matchedBags` are present or the list is empty, the `matchedVolume` is set to 0.
 * Otherwise, it retrieves the volumes of the matched milk bags from the `milkBags` collection
 * and sums them up to compute the total volume.
 *
 * @returns The updated transaction document with the calculated `matchedVolume`.
 */
export const calculateMatchedVolume: CollectionBeforeChangeHook<Transaction> = async ({
  req,
  data,
}) => {
  if (!data.matchedBags) {
    return data;
  }

  let bags = extractCollection(data.matchedBags);

  if (bags.length === 0) {
    const { docs } = await req.payload.find({
      collection: 'milkBags',
      depth: 0,
      req,
      select: { volume: true },
      pagination: false,
      where: { id: { in: extractID(data.matchedBags) } },
    });

    bags = docs as MilkBag[];
  }

  data.matchedVolume = bags.reduce((total, bag) => total + (bag.volume || 0), 0);

  return data;
};
