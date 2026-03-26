import { Donation, User } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addDonationToCache } from '../../lib/cacheUtils';
import { createUserDonationsInfQuery } from '../../lib/queryOptions/donations';

export function useInfiniteUserDonations(
  user: User | null | undefined,
  status: Donation['status']
) {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(createUserDonationsInfQuery(user, status));

  const { dataArray, dataMap } = useMemo(() => {
    const dataArray: Donation[] = [];
    const dataMap = new Map<string, Donation>();

    data?.pages.forEach((page) => {
      page.docs.forEach((donation, key) => {
        dataMap.set(key, donation);
        dataArray.push(donation);

        if (!query.isPlaceholderData) {
          addDonationToCache(queryClient, donation);
        }
      });
    });

    return { dataArray, dataMap };
  }, [data?.pages, query.isPlaceholderData, queryClient]);

  return { ...query, data: dataArray, dataMap };
}
