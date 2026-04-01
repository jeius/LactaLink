import { Request, User } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { addRequestToCache } from '../../lib/cacheUtils';
import { createUserRequestsInfQuery } from '../../lib/queryOptions/request';

export function useInfiniteUserRequests(user: User | null | undefined, status: Request['status']) {
  const queryClient = useQueryClient();
  const { data, ...query } = useInfiniteQuery(createUserRequestsInfQuery(user, status));

  const { dataArray, dataMap } = useMemo(() => {
    const dataArray: Request[] = [];
    const dataMap = new Map<string, Request>();

    data?.pages.forEach((page) => {
      page.docs.forEach((request, key) => {
        dataMap.set(key, request);
        dataArray.push(request);

        if (!query.isPlaceholderData) {
          addRequestToCache(queryClient, request);
        }
      });
    });

    return { dataArray, dataMap };
  }, [data?.pages, query.isPlaceholderData, queryClient]);

  return { ...query, data: dataArray, dataMap };
}
