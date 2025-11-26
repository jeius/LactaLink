import { useMeUser } from '@/hooks/auth/useAuth';
import { InfiniteDataMap } from '@/lib/types';
import { createDeleteCommentMutationKey } from '@/lib/utils/createKeys';
import { getApiClient } from '@lactalink/api';
import { Comment } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  removeCommentFromCache,
  updateCommentRepliesCountInCache,
  updatePostCommentsCountInCache,
} from '../lib/commentCacheUtils';
import { postsInfiniteOptions } from '../lib/queryOptions/postsInfiniteOptions';
import { DeleteCommentPayload } from '../lib/types';

export function useDeleteCommentMutation(commentsQueryKey: QueryKey) {
  const queryClient = useQueryClient();
  const { data: meUser } = useMeUser();

  const postsQueryKey = postsInfiniteOptions.queryKey;

  const deleteMutation = useMutation({
    mutationKey: createDeleteCommentMutationKey(meUser),
    meta: {
      errorMessage: (err) => extractErrorMessage(err),
    },
    mutationFn: async ({ id }: DeleteCommentPayload) => {
      const apiClient = getApiClient();
      return apiClient.deleteByID({ collection: 'comments', id });
    },
    onMutate: async ({ id: commentID, parent, post, queryKey }) => {
      // Cancel any outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey }),
        queryClient.cancelQueries(postsInfiniteOptions),
      ]);

      // Snapshot previous values
      const previousComments = queryClient.getQueryData<InfiniteDataMap<Comment>>(queryKey);
      const previousPosts = queryClient.getQueryData(postsQueryKey);
      const previousParentComments =
        queryClient.getQueryData<InfiniteDataMap<Comment>>(commentsQueryKey);

      // Optimistically remove the comment
      queryClient.setQueryData<InfiniteDataMap<Comment>>(queryKey, (oldData) =>
        removeCommentFromCache(oldData, commentID)
      );

      const parentID = extractID(parent);

      // If it's a root comment, update the post's commentsCount
      if (!parentID) {
        queryClient.setQueryData(postsQueryKey, (oldData) =>
          updatePostCommentsCountInCache(oldData, extractID(post), 'decrement')
        );
      } else {
        // For replies, we have to update the parent comment's replies count in the cache
        queryClient.setQueryData<InfiniteDataMap<Comment>>(commentsQueryKey, (oldData) =>
          updateCommentRepliesCountInCache(oldData, parentID, 'decrement')
        );
      }

      return { previousComments, previousPosts, previousParentComments };
    },
    onError: (_err, { parent, queryKey }, context) => {
      if (!context) return;
      const { previousComments, previousPosts, previousParentComments } = context;

      // Rollback optimistic updates
      if (previousComments) queryClient.setQueryData(queryKey, previousComments);
      if (!parent && previousPosts) {
        queryClient.setQueryData(postsQueryKey, previousPosts);
      } else if (previousParentComments) {
        queryClient.setQueryData(commentsQueryKey, previousParentComments);
      }
    },
    onSuccess: (_data, { queryKey }) => {
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return deleteMutation;
}
