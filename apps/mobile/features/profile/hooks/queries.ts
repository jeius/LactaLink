import { PopulatedUserProfile } from '@lactalink/types';
import { Post } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createInfiniteUserPostsQuery } from '../lib/queryOption';

export function useInfiniteUserPosts(userProfile: PopulatedUserProfile) {
  const { data, ...query } = useInfiniteQuery(createInfiniteUserPostsQuery(userProfile));

  const dataArray = useMemo(() => {
    if (!data) return generatePlaceHoldersWithID(10, {} as Post);
    return data.pages.flatMap((page) => Array.from(page.docs.values()));
  }, [data]);

  return { data: dataArray, dataMap: data, ...query };
}
