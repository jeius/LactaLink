import { getMeUser } from '@/lib/stores/meUserStore';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import { createDraftMilkbagsQuery } from '../queryOptions/milkbags';

export function addMilkBagToCache(client: QueryClient, milkBag: MilkBag) {
  const draftMilkbagsQueryOption = createDraftMilkbagsQuery(getMeUser());
  client.setQueryData(draftMilkbagsQueryOption.queryKey, (old) => {
    const newMap = old ? new Map(old) : new Map<string, MilkBag>();
    newMap.set(milkBag.id, milkBag);
    return newMap;
  });
}

export function updateMilkBagInCache(client: QueryClient, milkBag: MilkBag) {
  const draftMilkbagsQueryOption = createDraftMilkbagsQuery(getMeUser());

  client.setQueryData(draftMilkbagsQueryOption.queryKey, (old) => {
    if (!old || !old.has(milkBag.id)) return old;
    const newMap = new Map(old);
    newMap.set(milkBag.id, milkBag);
    return newMap;
  });
}

export function removeMilkBagFromCache(client: QueryClient, id: string) {
  const draftMilkbagsQueryOption = createDraftMilkbagsQuery(getMeUser());

  client.setQueryData(draftMilkbagsQueryOption.queryKey, (old) => {
    if (!old) return old;
    const newMap = new Map(old);
    newMap.delete(id);
    return newMap;
  });
}
