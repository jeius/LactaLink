import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { User } from '@lactalink/types/payload-generated-types';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { getLocalSearchHistory, getSearchHistory } from './utils';

type Options = {
  limit?: number;
  sort?: string;
};

export function createUserInfiniteQueryOptions(searchTerm: string, options?: Options) {
  const { limit = 16, sort } = options || {};

  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: ['user-search', searchTerm],
    queryFn: ({ pageParam }) => {
      const apiClient = getApiClient();
      return apiClient.find({
        collection: 'user-search',
        where: { searchExcerpt: { contains: searchTerm } },
        limit: limit,
        sort: sort,
        page: pageParam,
        pagination: true,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function createSearchHistoryQueryOptions(user: User | null) {
  return queryOptions({
    queryKey: [...QUERY_KEYS.SEARCH.USER, 'history', user?.id || 'guest'],
    queryFn: () => getLocalSearchHistory(user) || getSearchHistory(),
    initialData: getLocalSearchHistory(user),
  });
}
