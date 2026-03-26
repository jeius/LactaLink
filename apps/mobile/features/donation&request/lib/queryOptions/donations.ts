import { QUERY_KEYS } from '@/lib/constants';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { Donation, User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import {
  findDonation,
  findPaginatedIncomingDonations,
  findPaginatedUserDonations,
} from '../api/find';

export function createDonationQuery(doc: string | Donation | undefined, enabled = true) {
  const docID = extractID(doc);
  return queryOptions({
    enabled: !!doc && enabled,
    queryKey: [...QUERY_KEYS.DONATIONS.ONE, docID],
    queryFn: ({ signal }) => {
      if (!docID) throw new Error('Donation ID is required to fetch donation.');
      return findDonation(docID, { signal });
    },
    placeholderData: (prev) => prev ?? extractCollection(doc) ?? undefined,
  });
}

export function createIncomingDonationsInfQuery(user: User | null | undefined) {
  return infiniteQueryOptions({
    enabled: !!user,
    queryKey: [...QUERY_KEYS.DONATIONS.INFINITE, 'incoming', extractID(user)],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      if (!user) throw new Error('User is not logged in.');

      const userProfile = user.profile;

      if (!userProfile) throw new Error('User profile is required to fetch incoming donations.');

      const paginatedDocs = await findPaginatedIncomingDonations(
        userProfile,
        {
          page: pageParam,
          limit: 15,
        },
        { signal }
      );

      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => prev ?? generatePlaceHoldersForInfQueries<Donation>(10),
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  });
}

export function createUserDonationsInfQuery(
  user: User | null | undefined,
  status: Donation['status']
) {
  return infiniteQueryOptions({
    enabled: !!user,
    queryKey: [...QUERY_KEYS.DONATIONS.INFINITE, 'user', extractID(user), status],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      if (!user) throw new Error('User is not logged in.');
      const userProfile = user.profile;
      if (!userProfile) throw new Error('User profile is required to fetch user donations.');

      const paginatedDocs = await findPaginatedUserDonations(
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
    placeholderData: (prev) => prev ?? generatePlaceHoldersForInfQueries<Donation>(10),
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  });
}
