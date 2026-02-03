import { QUERY_KEYS } from '@/lib/constants';
import { generatePlaceHoldersForInfQueries } from '@/lib/utils/generatePlaceholdersForInfQueries';
import { transformToInfiniteDataMap } from '@/lib/utils/transformToInfiniteData';
import { getApiClient } from '@lactalink/api';
import { Address, User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { transformToPaginatedMappedDocs } from '@lactalink/utilities/transformers';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

const DEFAULT_DEPTH = 3;

export function createAddressQuery(address: string | Address | null | undefined) {
  const addressID = extractID(address);
  return queryOptions({
    enabled: !!addressID,
    queryKey: [...QUERY_KEYS.ADDRESSES.ONE, addressID],
    queryFn: async () => {
      if (!addressID) throw new Error('Address ID is required to fetch the address.');
      return getApiClient().findByID({
        collection: 'addresses',
        id: addressID,
        depth: DEFAULT_DEPTH,
        joins: { deliveryPreferences: false },
      });
    },
    placeholderData: extractCollection(address) || undefined,
  });
}

export function createAddressesInfQuery(user: string | User | null | undefined) {
  const userID = extractID(user);
  const limit = 10;

  const addresses = extractCollection(user)?.addresses;
  const initialData = transformToInfiniteDataMap(addresses);

  return infiniteQueryOptions({
    enabled: !!userID,
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.ADDRESSES.INFINITE, userID],
    queryFn: async ({ pageParam }) => {
      if (!userID) throw new Error('User ID is required to fetch addresses.');

      const paginatedDocs = await getApiClient().find({
        collection: 'addresses',
        limit,
        page: pageParam,
        pagination: true,
        depth: DEFAULT_DEPTH,
        joins: { deliveryPreferences: false },
        where: { owner: { equals: userID } },
      });

      return transformToPaginatedMappedDocs(paginatedDocs);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: initialData ?? generatePlaceHoldersForInfQueries<Address>(limit),
  });
}
