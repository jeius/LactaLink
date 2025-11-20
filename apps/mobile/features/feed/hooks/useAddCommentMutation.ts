import { useMeUser } from '@/hooks/auth/useAuth';
import { InfiniteDataMap } from '@/lib/types';
import { createAddCommentMutationKey } from '@/lib/utils/createKeys';
import { getApiClient } from '@lactalink/api';
import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addCommentToCache,
  updateCommentRepliesCountInCache,
  updatePostCommentsCountInCache,
} from '../lib/commentCacheUtils';
import { CommentMutationContext, CommentPayload } from '../lib/types';

export function useAddCommentMutation(postsQueryKey: QueryKey, commentsQueryKey: QueryKey) {
  const queryClient = useQueryClient();
  const { data: meUser } = useMeUser();

  const addMutation = useMutation<
    Comment,
    Error,
    CommentPayload,
    CommentMutationContext<InfiniteDataMap<Comment | Post>>
  >({
    mutationKey: createAddCommentMutationKey(meUser),
    meta: {
      errorMessage: (err) => extractErrorMessage(err),
    },
    mutationFn: async ({ queryKey, ...commentData }) => {
      const apiClient = getApiClient();
      return apiClient.create({
        collection: 'comments',
        data: {
          post: extractID(commentData.post),
          parent: extractID(commentData.parent),
          repliedTo: extractID(commentData.repliedTo),
          content: commentData.content,
          author: {
            relationTo: commentData.author.relationTo,
            value: extractID(commentData.author.value),
          },
        },
      });
    },
    onMutate: async ({ queryKey, ...newComment }) => {
      // Cancel any outgoing refetches
      await Promise.all([
        queryClient.cancelQueries({ queryKey }),
        queryClient.cancelQueries({ queryKey: postsQueryKey }),
      ]);

      // Snapshot previous values
      const previousComments = queryClient.getQueryData<InfiniteDataMap<Comment>>(queryKey);
      const previousPosts = queryClient.getQueryData<InfiniteDataMap<Post>>(postsQueryKey);
      const previousParentComments =
        queryClient.getQueryData<InfiniteDataMap<Comment>>(commentsQueryKey);

      // Optimistically update comments cache
      queryClient.setQueryData<InfiniteDataMap<Comment>>(queryKey, (oldData) =>
        addCommentToCache(oldData, newComment)
      );

      const parentID = extractID(newComment.parent);

      // If it's a root comment, update the post's commentsCount
      if (!parentID) {
        queryClient.setQueryData<InfiniteDataMap<Post>>(postsQueryKey, (oldData) =>
          updatePostCommentsCountInCache(oldData, extractID(newComment.post), 'increment')
        );
      } else {
        // For replies, we have to update the parent comment's replies count in the cache
        queryClient.setQueryData<InfiniteDataMap<Comment>>(commentsQueryKey, (oldData) =>
          updateCommentRepliesCountInCache(oldData, parentID, 'increment')
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

  return addMutation;
}
