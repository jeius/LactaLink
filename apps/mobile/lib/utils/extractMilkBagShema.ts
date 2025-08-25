import { MilkBag, MilkBagSchema } from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { extractImageSchema } from './extractImageSchema';

export function extractMilkBagSchema<T extends string | MilkBag | null>(
  bag?: string | MilkBag | null
): T extends MilkBag ? MilkBagSchema : null {
  if (!bag || typeof bag === 'string') return null as T extends MilkBag ? MilkBagSchema : null;

  return {
    id: bag.id,
    volume: bag.volume,
    code: bag.code,
    status: bag.status,
    collectedAt: bag.collectedAt,
    donor: extractID(bag.donor),
    bagImage: extractImageSchema(extractCollection(bag.bagImage)),
  } as T extends MilkBag ? MilkBagSchema : null;
}
