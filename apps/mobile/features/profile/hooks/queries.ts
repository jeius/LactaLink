import { PopulatedUserProfile } from '@lactalink/types';
import { Post } from '@lactalink/types/payload-generated-types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createInfiniteUserPostsQuery } from '../lib/queryOption';

export function useInfiniteUserPosts(userProfile: PopulatedUserProfile) {
  const { data, ...query } = useInfiniteQuery(createInfiniteUserPostsQuery(userProfile));

  const { dataArray, dataMap } = useMemo(() => {
    const dataArray: Post[] = [];
    const dataMap = new Map<string, Post>();

    data?.pages.forEach((page) => {
      page.docs.forEach((post) => {
        dataMap.set(post.id, post);
        dataArray.push(post);
      });
    });

    return { dataArray, dataMap };
  }, [data]);

  return { data: dataArray, dataMap, ...query };
}
