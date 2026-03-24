import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { User } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { findPaginatedMilkBagsByDonor } from '../api/find';

export function createDraftMilkbagsQuery(user: User | null = null) {
  const queryKey = [...QUERY_KEYS.MILKBAGS.ALL];
  const profileID = extractID(user?.profile?.value);
  if (profileID) queryKey.push(profileID);

  return queryOptions({
    enabled: !!profileID,
    queryKey: queryKey,
    queryFn: async ({ signal }) => {
      if (!profileID) throw new Error('Profile is required to fetch draft milk bags.');

      const apiClient = getApiClient();

      const docs = await apiClient.find(
        {
          collection: 'milkBags',
          sort: 'createdAt',
          draft: true,
          depth: 3,
          pagination: false,
          where: {
            and: [{ donor: { equals: profileID } }, { _status: { equals: 'draft' } }],
          },
        },
        { signal }
      );

      return new Map(docs.map((doc) => [doc.id, doc]));
    },
  });
}

export function createMilkbagsByDonorInfQuery(user: User | null = null, draft = false) {
  const profileID = extractID(user?.profile?.value);
  const queryKey = [...QUERY_KEYS.MILKBAGS.INFINITE];

  if (profileID) queryKey.push(profileID);
  if (draft) queryKey.push('draft');

  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: queryKey,
    queryFn: async ({ pageParam }) => {
      if (!profileID) throw new Error('Profile is required to fetch milk bags.');

      const paginatedDocs = await findPaginatedMilkBagsByDonor(profileID, {
        page: pageParam,
        draft: draft,
      });

      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
  });
}
