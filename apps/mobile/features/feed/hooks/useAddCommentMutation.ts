import { useMeUser } from '@/hooks/auth/useAuth';
import { InfiniteDataMap } from '@/lib/types';
import { createAddCommentMutationKey } from '@/lib/utils/createKeys';
import { getApiClient } from '@lactalink/api';
import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addCommentToCache,
  updateCommentRepliesCountInCache,
  updatePostCommentsCountInCache,
} from '../lib/commentCacheUtils';
import { createCommentsInfiniteOptions } from '../lib/queryOptions/commentsInfiniteOptions';
import { postsInfiniteOptions } from '../lib/queryOptions/postsInfiniteOptions';
import { CommentPayload } from '../lib/types';

export function useAddCommentMutation(postID: Post['id']) {
  const queryClient = useQueryClient();
  const { data: meUser } = useMeUser();

  const postsQueryKey = postsInfiniteOptions.queryKey;
  const commentsInfiniteOptions = createCommentsInfiniteOptions(postID);
  const commentsQueryKey = commentsInfiniteOptions.queryKey;

  const addMutation = useMutation({
    mutationKey: createAddCommentMutationKey(meUser),
    meta: {
      errorMessage: (err) => extractErrorMessage(err),
    },
    mutationFn: async ({ queryKey, ...commentData }: CommentPayload) => {
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
        queryClient.cancelQueries(postsInfiniteOptions),
      ]);

      // Snapshot previous values
      const previousComments = queryClient.getQueryData<InfiniteDataMap<Comment>>(queryKey);
      const previousPosts = queryClient.getQueryData(postsQueryKey);
      const previousParentComments = queryClient.getQueryData(commentsQueryKey);

      // Optimistically update comments cache
      queryClient.setQueryData<InfiniteDataMap<Comment>>(queryKey, (oldData) =>
        addCommentToCache(oldData, newComment)
      );

      const parentID = extractID(newComment.parent);

      // If it's a root comment, update the post's commentsCount
      if (!parentID) {
        queryClient.setQueryData(postsQueryKey, (oldData) =>
          updatePostCommentsCountInCache(oldData, extractID(newComment.post), 'increment')
        );
      } else {
        // For replies, we have to update the parent comment's replies count in the cache
        queryClient.setQueryData(commentsQueryKey, (oldData) =>
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
