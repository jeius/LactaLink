import { INFINITE_QUERY_KEY } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { Post } from '@lactalink/types/payload-generated-types';
import { Where } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useMeUser } from '../auth/useAuth';
import { useStoredInfiniteData } from '../useStoredData';

interface Config {
  where?: Where;
  limit?: number;
  sort?: string;
  depth?: number;
}

export function useInfinitePosts(config: Config) {
  const { data: meUser } = useMeUser();
  const meProfile = meUser?.profile;

  const { limit = 15, sort = '-createdAt', depth = 5 } = config;

  const [savedData, setSavedData] = useStoredInfiniteData<Post>('infinite-posts');

  const queryKey = [...INFINITE_QUERY_KEY, limit, sort, config.where ?? {}];

  const { data, ...query } = useInfiniteQuery({
    initialPageParam: 1,
    placeholderData: savedData,
    queryKey,
    queryFn: async ({ pageParam }) => {
      const api = getApiClient();
      const { docs, ...rest } = await api.find({
        collection: 'posts',
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
          comments: { limit: 4, sort: '-createdAt', count: true },
          shares: { count: true },
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
    getNextPageParam: (page) => page.nextPage || null,
    getPreviousPageParam: (page) => page.prevPage || null,
  });

  const dataArray = useMemo(() => data?.pages.flatMap((p) => Array.from(p.docs.values())), [data]);

  useEffect(() => {
    if (data) {
      console.log(
        'useInfinitePost:',
        data.pages.flatMap((p) => Array.from(p.docs.values()))
      );
      //@ts-expect-error Safe type error
      setSavedData(data);
    }
  }, [data, setSavedData]);

  return {
    queryKey,
    data: dataArray,
    ...query,
  };
}
