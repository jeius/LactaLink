import { useMeUser } from '@/hooks/auth/useAuth';
import { INFINITE_QUERY_KEY } from '@/lib/constants/queryKeys';
import { InfiniteDataMap } from '@/lib/types';
import { getApiClient } from '@lactalink/api';
import { Comment } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Config, UseInfiniteCommentsReturn } from '../lib/types';

export function useInfiniteComments(
  initialData?: InfiniteDataMap<Comment>,
  config: Config = {}
): UseInfiniteCommentsReturn {
  const { data: meUser } = useMeUser();
  const meProfile = meUser?.profile;

  const { limit = 10, sort = '-createdAt', depth = 5 } = config;

  const queryKey = [...INFINITE_QUERY_KEY, 'comments', limit, sort, config.where ?? {}];

  const { data, ...query } = useInfiniteQuery({
    enabled: config.enabled ?? true,
    initialPageParam: 1,
    initialData: initialData,
    getNextPageParam: (page) => page.nextPage || null,
    getPreviousPageParam: (page) => page.prevPage || null,
    // placeholderData: (prev) => prev,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryKey,
    queryFn: async ({ pageParam }) => {
      const api = getApiClient();
      const { docs, ...rest } = await api.find({
        collection: 'comments',
        page: pageParam,
        limit,
        sort,
        depth,
        where: config.where,
        pagination: true,
        populate: {
          likes: { createdBy: true },
        },
        joins: {
          replies: { count: true, sort: '-createdAt', limit: 4 },
          likes: {
            count: true,
            where: {
              and: [
                { 'createdBy.relationTo': { equals: meProfile?.relationTo || '' } },
                { 'createdBy.value': { equals: extractID(meProfile?.value) || '' } },
              ],
            },
          },
        },
      });

      const map = new Map(docs.map((d) => [d.id, d]));
      return { docs: map, ...rest };
    },
  });

  const dataArray = useMemo(() => data?.pages.flatMap((p) => Array.from(p.docs.values())), [data]);

  return {
    queryKey,
    data: dataArray,
    paginatedData: data,
    ...query,
  };
}
