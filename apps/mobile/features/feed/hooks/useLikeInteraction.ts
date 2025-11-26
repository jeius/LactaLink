import { useMeUser } from '@/hooks/auth/useAuth';
import { InfiniteDataMap } from '@/lib/types';
import { createLikeMutationKey } from '@/lib/utils/createKeys';
import { extractLikesData } from '@/lib/utils/extractLikesData';
import { createTempID, isTempID } from '@/lib/utils/tempID';
import { getApiClient } from '@lactalink/api';
import { Comment, Like, Post } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { updateLikeInCache } from '../lib/likeCacheUtils';
import { LikableRelation, LikeMutationContext } from '../lib/types';

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
  const queryClient = useQueryClient();

  const documentId = document.id;

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

  const likeMutation = useMutation<Like, Error, void, LikeMutationContext>({
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
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous data
      const previousData = queryClient.getQueryData<InfiniteDataMap<Post | Comment>>(queryKey);

      // Optimistically update cache
      const likeToProcess = currentLike ?? createTemporaryLike();
      const operation = currentLike ? 'remove' : 'add';

      queryClient.setQueryData<InfiniteDataMap<Post | Comment>>(queryKey, (oldData) =>
        updateLikeInCache(oldData, documentId, likeToProcess, user, operation)
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSuccess: () => {
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey });
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
