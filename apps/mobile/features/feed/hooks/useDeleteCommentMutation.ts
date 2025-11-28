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
  updatePostCommentsCount,
  updatePostCommentsCountInCache,
} from '../lib/commentCacheUtils';
import { createPostQueryOptions } from '../lib/queryOptions/postQueryOptions';
import { postsInfiniteOptions } from '../lib/queryOptions/postsInfiniteOptions';
import { DeleteCommentPayload } from '../lib/types';

export function useDeleteCommentMutation(commentsQueryKey: QueryKey) {
  const client = useQueryClient();
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
    onMutate: async ({ id: commentID, parent, post, queryKey }, { client }) => {
      const postQueryOptions = createPostQueryOptions(extractID(post));

      // Cancel any outgoing refetches
      await Promise.all([
        client.cancelQueries({ queryKey }),
        client.cancelQueries(postsInfiniteOptions),
        client.cancelQueries({ queryKey: commentsQueryKey }),
        client.cancelQueries(postQueryOptions),
      ]);

      // Snapshot previous values
      const previousComments = client.getQueryData<InfiniteDataMap<Comment>>(queryKey);
      const previousPosts = client.getQueryData(postsQueryKey);
      const previousParentComments =
        client.getQueryData<InfiniteDataMap<Comment>>(commentsQueryKey);
      const prevPost = client.getQueryData(postQueryOptions.queryKey);

      // Optimistically remove the comment
      client.setQueryData<InfiniteDataMap<Comment>>(queryKey, (oldData) =>
        removeCommentFromCache(oldData, commentID)
      );

      const parentID = extractID(parent);

      // If it's a root comment, update the post's commentsCount
      if (!parentID) {
        client.setQueryData(postsQueryKey, (oldData) =>
          updatePostCommentsCountInCache(oldData, extractID(post), 'decrement')
        );
        client.setQueryData(postQueryOptions.queryKey, (oldData) =>
          updatePostCommentsCount(oldData, 'decrement')
        );
      } else {
        // For replies, we have to update the parent comment's replies count in the cache
        client.setQueryData<InfiniteDataMap<Comment>>(commentsQueryKey, (oldData) =>
          updateCommentRepliesCountInCache(oldData, parentID, 'decrement')
        );
      }

      return { previousComments, previousPosts, previousParentComments, prevPost };
    },
    onError: (_err, { parent, queryKey, post }, ctx, { client }) => {
      if (!ctx) return;
      const postQueryOptions = createPostQueryOptions(extractID(post));
      const { previousComments, previousPosts, previousParentComments } = ctx;

      // Rollback optimistic updates
      if (previousComments) client.setQueryData(queryKey, previousComments);
      if (!parent) {
        client.setQueryData(postsQueryKey, previousPosts);
        client.setQueryData(postQueryOptions.queryKey, ctx.prevPost);
      } else {
        client.setQueryData(commentsQueryKey, previousParentComments);
      }
    },
    onSuccess: (_data, { queryKey }) => {
      // Invalidate to ensure fresh data
      client.invalidateQueries({ queryKey });
    },
  });

  return deleteMutation;
}
