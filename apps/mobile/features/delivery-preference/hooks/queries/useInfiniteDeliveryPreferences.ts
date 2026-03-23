import { DeliveryPreference, User } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addDeliveryPreferenceToCache } from '../../lib/cacheUtils';
import { createDeliveryPreferenceInfQuery } from '../../lib/queryOptions';

export function useInfiniteDeliveryPreferences(user: string | User | null | undefined) {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(createDeliveryPreferenceInfQuery(user));

  const { dataArray, dataMap } = useMemo(() => {
    const dataArray: DeliveryPreference[] = [];
    const dataMap: Map<string, DeliveryPreference> = new Map();

    if (data === undefined) {
      return { dataArray, dataMap };
    }

    data.pages.forEach((page) => {
      page.docs.forEach((doc) => {
        dataArray.push(doc);
        dataMap.set(doc.id, doc);

        if (!query.isPlaceholderData) {
          addDeliveryPreferenceToCache(queryClient, doc);
        }
      });
    });
    return { dataArray, dataMap };
  }, [data, query.isPlaceholderData, queryClient]);

  return { ...query, data: dataArray, dataMap };
}
