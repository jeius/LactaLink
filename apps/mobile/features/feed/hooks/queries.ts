import { storeInfiniteDocuments } from '@/lib/localStorage/utils';
import { infiniteDataMapExtractor } from '@/lib/utils/infiniteDataMapExtractor';
import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { STORED_POSTS_KEY } from '../lib/constants';
import { addPostToCache } from '../lib/postCacheUtils';
import { createCommentsInfQuery, createRepliesInfQuery } from '../lib/queryOptions/comments';
import { createPostInfQuery, createPostQueryOptions } from '../lib/queryOptions/posts';

// #region Posts Queries
export function useInfinitePosts() {
  const queryClient = useQueryClient();
  const { data, isPlaceholderData, ...query } = useInfiniteQuery(createPostInfQuery());

  const { dataArray, dataMap } = useMemo(
    () =>
      infiniteDataMapExtractor(data, (item) => {
        if (!isPlaceholderData) addPostToCache(queryClient, item);
      }),
    [data, isPlaceholderData, queryClient]
  );

  useEffect(() => {
    const storageKey = STORED_POSTS_KEY;
    if (data) storeInfiniteDocuments(data, storageKey);
  }, [data]);

  return { ...query, dataMap, data: dataArray, isPlaceholderData };
}

export function usePostQuery(id: Post['id'], initialData?: Post) {
  return useQuery(createPostQueryOptions(id, initialData));
}

// #endregion

// #region Comments Queries
export function useInfiniteComments(post: string | Post | null | undefined) {
  const postID = extractID(post);
  const { data, ...query } = useInfiniteQuery(createCommentsInfQuery(postID));
  const { dataArray, dataMap } = useMemo(() => infiniteDataMapExtractor(data), [data]);
  return { data: dataArray, dataMap, ...query };
}
// #endregion

// #region Replies Queries
export function useInfiniteReplies(comment: string | Comment | null | undefined, enabled = true) {
  const commentID = extractID(comment);
  const { data, ...query } = useInfiniteQuery(createRepliesInfQuery(commentID, enabled));
  const { dataArray, dataMap } = useMemo(() => infiniteDataMapExtractor(data), [data]);
  return { data: dataArray, dataMap, ...query };
}
// #endregion
