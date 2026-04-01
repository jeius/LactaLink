import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { Request, User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { findPaginatedIncomingRequests, findPaginatedUserRequests, findRequest } from '../api/find';

export function createRequestQuery(doc: string | Request | undefined, enabled = true) {
  const docID = extractID(doc);
  return queryOptions({
    enabled: !!doc && enabled,
    queryKey: [...QUERY_KEYS.REQUESTS.ONE, docID],
    queryFn: () => {
      if (!docID) throw new Error('Request ID is required to fetch request.');
      return findRequest(docID);
    },
    initialData: extractCollection(doc) || undefined,
  });
}

export function createIncomingRequestsInfQuery(user: User | null | undefined) {
  return infiniteQueryOptions({
    enabled: !!user,
    queryKey: [...QUERY_KEYS.REQUESTS.INFINITE, 'incoming', extractID(user)],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!user) throw new Error('User is not logged in.');

      const userProfile = user.profile;

      if (!userProfile) throw new Error('User profile is required to fetch incoming donations.');

      const paginatedDocs = await findPaginatedIncomingRequests(userProfile, {
        page: pageParam,
        limit: 15,
      });

      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: generatePlaceHoldersForInfQueries<Request>(10),
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  });
}

export function createUserRequestsInfQuery(
  user: User | null | undefined,
  status: Request['status']
) {
  return infiniteQueryOptions({
    enabled: !!user,
    queryKey: [...QUERY_KEYS.DONATIONS.INFINITE, 'user', extractID(user), status],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      if (!user) throw new Error('User is not logged in.');
      const userProfile = user.profile;
      if (!userProfile) throw new Error('User profile is required to fetch user donations.');

      const paginatedDocs = await findPaginatedUserRequests(
        userProfile,
        {
          page: pageParam,
          limit: 15,
          status,
        },
        { signal }
      );

      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => prev ?? generatePlaceHoldersForInfQueries<Request>(10),
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  });
}
