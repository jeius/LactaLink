import { getMeUser } from '@/lib/stores/meUserStore';
import {
  removeItemFromInfiniteDataMap,
  updateInfiniteDataMap,
} from '@/lib/utils/infiniteListUtils';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import { createDraftMilkbagsQuery, createMilkbagsByDonorInfQuery } from '../queryOptions/milkbags';

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

export function addMilkBagToInfiniteCache(
  client: QueryClient,
  milkBag: MilkBag,
  method?: 'push' | 'unshift'
) {
  const queryKey = createMilkbagsByDonorInfQuery(getMeUser()).queryKey;

  client.setQueryData(queryKey, (old) => {
    if (!old) return old;
    return updateInfiniteDataMap(old, milkBag, method);
  });
}

export function updateMilkBagInInfiniteCache(client: QueryClient, milkBag: MilkBag) {
  const queryKey = createMilkbagsByDonorInfQuery(getMeUser()).queryKey;

  client.setQueryData(queryKey, (old) => {
    if (!old) return old;
    return updateInfiniteDataMap(old, milkBag, 'none');
  });
}

export function removeMilkBagFromInfiniteCache(client: QueryClient, id: string) {
  const queryKey = createMilkbagsByDonorInfQuery(getMeUser()).queryKey;

  client.setQueryData(queryKey, (old) => {
    if (!old) return old;
    return removeItemFromInfiniteDataMap(old, id);
  });
}
