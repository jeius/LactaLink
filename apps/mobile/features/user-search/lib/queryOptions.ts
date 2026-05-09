import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@/lib/services';
import { UserProfile } from '@lactalink/types';
import { User } from '@lactalink/types/payload-generated-types';
import { Where } from '@lactalink/types/payload-types';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { getLocalSearchHistory, getSearchHistory } from './utils';

type Options = {
  limit?: number;
  sort?: string;
  profileTypes?: UserProfile['relationTo'][];
};

export function createUserInfiniteQueryOptions(searchTerm: string, options?: Options) {
  const { limit = 15, sort, profileTypes } = options || {};

  const filters: Where[] = [{ searchExcerpt: { contains: searchTerm } }];

  return infiniteQueryOptions({
    enabled: searchTerm.length > 1,
    initialPageParam: 1,
    queryKey: [
      ...QUERY_KEYS.SEARCH.USER,
      searchTerm,
      profileTypes ? profileTypes.join(',') : 'all',
    ],
    queryFn: async ({ pageParam, signal }) => {
      const apiClient = getApiClient();
      const paginatedDocs = await apiClient.find(
        {
          collection: 'user-search',
          where: { and: filters },
          limit: limit,
          sort: sort,
          page: pageParam,
          pagination: true,
        },
        { signal }
      );

      const filteredDocs = profileTypes
        ? paginatedDocs.docs.filter(({ doc }) => profileTypes.includes(doc.relationTo))
        : paginatedDocs.docs;

      return { ...paginatedDocs, docs: filteredDocs };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => prev,
  });
}

export function createSearchHistoryQueryOptions(user: User | null) {
  return queryOptions({
    queryKey: [...QUERY_KEYS.SEARCH.USER, 'history', user?.id || 'guest'],
    queryFn: () => getLocalSearchHistory(user) || getSearchHistory(),
    initialData: getLocalSearchHistory(user),
  });
}
