import { getStoredInfiniteDocuments, storeInfiniteDocuments } from '@/lib/localStorage/utils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { infiniteQueryOptions } from '@tanstack/react-query';

const BASE_KEY = 'infinite-conversations';

export const conversationsInfiniteOptions = infiniteQueryOptions({
  initialPageParam: 1,
  queryKey: ['conversations'],
  queryFn: async ({ pageParam }) => {
    const apiClient = getApiClient();
    const { docs, ...conversations } = await apiClient.find({
      collection: 'conversations',
      pagination: true,
      page: pageParam,
      limit: 15,
      depth: 5,
      sort: '-lastMessageAt',
    });
    return { ...conversations, docs: new Map(docs.map((d) => [d.id, d])) };
  },
  getNextPageParam: (page) => page.nextPage,
  getPreviousPageParam: (page) => page.prevPage,
  placeholderData: (prevData) => {
    const storageKey = createStorageKeyByUser(getMeUser(), BASE_KEY);
    if (!prevData) return getStoredInfiniteDocuments(storageKey);
    storeInfiniteDocuments(prevData, storageKey);
    return prevData;
  },
});
