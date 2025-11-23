import { useMeUser } from '@/hooks/auth/useAuth';
import { useStoredInfiniteData } from '@/hooks/useStoredData';
import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

export function useInfinitePosts() {
  const { data: meUser } = useMeUser();
  const meProfile = meUser?.profile;

  const [savedData, setSavedData] = useStoredInfiniteData<Post>('infinite-posts');

  const queryKey = QUERY_KEYS.POSTS.INFINITE;

  const { data, ...query } = useInfiniteQuery({
    initialPageParam: 1,
    placeholderData: savedData,
    queryKey,
    queryFn: async ({ pageParam }) => {
      const api = getApiClient();
      const { docs, ...rest } = await api.find({
        collection: 'posts',
        page: pageParam,
        limit: 15,
        sort: '-createdAt',
        depth: 5,
        pagination: true,
        populate: {
          likes: { createdBy: true },
        },
        joins: {
          comments: false,
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
