import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { storeInfiniteDocuments } from '@/lib/localStorage/utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { postsInfiniteOptions } from '../lib/queryOptions/postsInfiniteOptions';

export function useInfinitePosts() {
  const { data, ...query } = useInfiniteQuery(postsInfiniteOptions);

  const dataArray = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => Array.from(page.docs.values()));
  }, [data]);

  useEffect(() => {
    const storageKey = QUERY_KEYS.POSTS.INFINITE.join('-');
    if (data) storeInfiniteDocuments(data, storageKey);
  });

  return { ...query, dataMap: data, data: dataArray };
}
