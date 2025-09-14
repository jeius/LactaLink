import { MilkBag } from '@lactalink/types/payload-generated-types';

export function segregateMilkBags<T extends Pick<MilkBag, 'volume' | 'collectedAt'>>(
  milkBags: T[]
) {
  const segregated: Record<string, T[]> = {};

  milkBags.forEach((bag) => {
    const key = String(bag.volume) + '-' + bag.collectedAt;
    if (!segregated[key]) {
      segregated[key] = [];
    }
    segregated[key].push(bag);
  });

  return segregated;
}
