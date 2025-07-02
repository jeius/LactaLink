import { MilkBag } from '@lactalink/types';

export function segregateMilkBags(milkBags: MilkBag[]) {
  const segregated: Record<string, MilkBag[]> = {};

  milkBags.forEach((bag) => {
    const key = String(bag.volume);
    if (!segregated[key]) {
      segregated[key] = [];
    }
    segregated[key].push(bag);
  });

  return segregated;
}
