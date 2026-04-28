import { QUERY_KEYS } from '@/lib/constants';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { getMyNotifications, getMyUnseenNotifCount } from './api/find';

export function createMyNotificationsInfQueryOptions() {
  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: QUERY_KEYS.NOTIFICATIONS.INFINITE,
    queryFn: async ({ pageParam, signal }) => {
      const paginatedDocs = await getMyNotifications({ page: pageParam }, { signal });
      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (page) => page.nextPage,
    getPreviousPageParam: (page) => page.prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      return generatePlaceHoldersForInfQueries(10);
    },
  });
}

export function createMyUnseenNotifCountQueryOptions() {
  return queryOptions({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS.COUNT, 'unseen'],
    queryFn: async ({ signal }) => {
      return getMyUnseenNotifCount({ signal });
    },
  });
}
