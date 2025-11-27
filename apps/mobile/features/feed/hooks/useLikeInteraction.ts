import { useMeUser } from '@/hooks/auth/useAuth';
import { InfiniteDataMap } from '@/lib/types';
import { createLikeMutationKey } from '@/lib/utils/createKeys';
import { extractLikesData } from '@/lib/utils/extractLikesData';
import { createTempID, isTempID } from '@/lib/utils/tempID';
import { getApiClient } from '@lactalink/api';
import { Comment, Like, Post } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { QueryKey, useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { updateLikeInCache, updatePostLikesInCache } from '../lib/likeCacheUtils';
import { createPostQueryOptions } from '../lib/queryOptions/postQueryOptions';
import { LikableRelation } from '../lib/types';

/**
 * Hook for managing like interactions on posts and comments
 * Provides optimistic updates and automatic cache synchronization
 */
export function useLikeInteraction(
  { relationTo, value: document }: LikableRelation,
  queryKey: QueryKey
) {
  const { data: user } = useMeUser();
  const profile = user?.profile;

  const documentId = document.id;

  const postQueryOptions = createPostQueryOptions(documentId);

  // Extract current like state
  const { likeData: currentLike, likesCount } = useMemo(
    () => extractLikesData(document, user),
    [document, user]
  );

  const isTemporary = currentLike ? isTempID(currentLike.id) : false;

  /**
   * Creates a temporary like object for optimistic updates
   */
  const createTemporaryLike = (): Like => ({
    id: createTempID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    liked: { relationTo, value: documentId },
    createdBy: {
      relationTo: profile!.relationTo,
      value: extractID(profile!.value),
    },
  });

  const likeMutation = useMutation({
    mutationKey: createLikeMutationKey({ relationTo, value: documentId }),
    meta: {
      errorMessage: (err) => extractErrorMessage(err),
    },
    mutationFn: async () => {
      const apiClient = getApiClient();

      // Unlike if already liked, otherwise like
      if (currentLike) {
        return apiClient.deleteByID({ collection: 'likes', id: currentLike.id });
      }

      return apiClient.create({
        collection: 'likes',
        data: {
          liked: { relationTo, value: documentId },
          createdBy: {
            relationTo: profile!.relationTo,
            value: extractID(profile!.value),
          },
        },
      });
    },
    onMutate: async (_, { client }) => {
      // Cancel outgoing refetches
      await client.cancelQueries({ queryKey });
      await client.cancelQueries(postQueryOptions);

      // Snapshot previous data
      const previousData = client.getQueryData<InfiniteDataMap<Post | Comment>>(queryKey);
      const prevPost = client.getQueryData(postQueryOptions.queryKey);

      // Optimistically update cache
      const likeToProcess = currentLike ?? createTemporaryLike();
      const operation = currentLike ? 'remove' : 'add';

      client.setQueryData<InfiniteDataMap<Post | Comment>>(queryKey, (oldData) =>
        updateLikeInCache(oldData, documentId, likeToProcess, user, operation)
      );

      client.setQueryData(postQueryOptions.queryKey, (oldData) =>
        updatePostLikesInCache(oldData, likeToProcess, user, operation)
      );

      return { previousData, prevPost };
    },
    onError: (_err, _variables, ctx, { client }) => {
      // Rollback on error
      if (ctx) {
        client.setQueryData(queryKey, ctx.previousData);
        client.setQueryData(postQueryOptions.queryKey, ctx.prevPost);
      }
    },
    onSettled: (_data, _err, _vars, _ctx, { client }) => {
      // Invalidate to ensure fresh data
      client.invalidateQueries({ queryKey });
      client.invalidateQueries(postQueryOptions);
    },
  });

  return {
    hasLiked: !!currentLike,
    toggleLike: likeMutation.mutate,
    likesCount,
    isPending: likeMutation.isPending || isTemporary,
    likeData: currentLike,
  };
}
