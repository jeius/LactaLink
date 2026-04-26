import { infiniteDataMapExtractor } from '@/lib/utils/infiniteDataMapExtractor';
import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createCommentsInfQuery, createRepliesInfQuery } from '../lib/queryOptions/comments';

export function useInfiniteComments(post: string | Post | null | undefined) {
  const postID = extractID(post);
  const { data, ...query } = useInfiniteQuery(createCommentsInfQuery(postID));
  const { dataArray, dataMap } = useMemo(() => infiniteDataMapExtractor(data), [data]);
  return { data: dataArray, dataMap, ...query };
}

export function useInfiniteReplies(comment: string | Comment | null | undefined, enabled = true) {
  const commentID = extractID(comment);
  const { data, ...query } = useInfiniteQuery(createRepliesInfQuery(commentID, enabled));
  const { dataArray, dataMap } = useMemo(() => infiniteDataMapExtractor(data), [data]);
  return { data: dataArray, dataMap, ...query };
}
