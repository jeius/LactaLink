import { MilkBag } from '@lactalink/types';

export function segregateMilkBags<T extends Pick<MilkBag, 'volume'>>(milkBags: T[]) {
  const segregated: Record<string, T[]> = {};

  milkBags.forEach((bag) => {
    const key = String(bag.volume);
    if (!segregated[key]) {
      segregated[key] = [];
    }
    segregated[key].push(bag);
  });

  return segregated;
}
