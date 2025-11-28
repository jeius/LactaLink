import { useMeUser } from '@/hooks/auth/useAuth';
import { InfiniteDataMap } from '@/lib/types';
import { createAddCommentMutationKey } from '@/lib/utils/createKeys';
import { getApiClient } from '@lactalink/api';
import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { useMutation } from '@tanstack/react-query';
import {
  addCommentToCache,
  updateCommentRepliesCountInCache,
  updatePostCommentsCount,
  updatePostCommentsCountInCache,
} from '../lib/commentCacheUtils';
import { createCommentsInfiniteOptions } from '../lib/queryOptions/commentsInfiniteOptions';
import { createPostQueryOptions } from '../lib/queryOptions/postQueryOptions';
import { postsInfiniteOptions } from '../lib/queryOptions/postsInfiniteOptions';
import { CommentPayload } from '../lib/types';

export function useAddCommentMutation(postID: Post['id']) {
  const { data: meUser } = useMeUser();

  const postQueryOptions = createPostQueryOptions(postID);
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
    onMutate: async ({ queryKey, ...newComment }, { client }) => {
      // Cancel any outgoing refetches
      await Promise.all([
        client.cancelQueries({ queryKey }),
        client.cancelQueries(postsInfiniteOptions),
        client.cancelQueries(commentsInfiniteOptions),
        client.cancelQueries(postQueryOptions),
      ]);

      // Snapshot previous values
      const previousComments = client.getQueryData<InfiniteDataMap<Comment>>(queryKey);
      const previousPosts = client.getQueryData(postsQueryKey);
      const previousParentComments = client.getQueryData(commentsQueryKey);
      const prevPost = client.getQueryData(postQueryOptions.queryKey);

      // Optimistically update comments cache
      client.setQueryData<InfiniteDataMap<Comment>>(queryKey, (oldData) =>
        addCommentToCache(oldData, newComment)
      );

      const parentID = extractID(newComment.parent);

      // If it's a root comment, update the post's commentsCount
      if (!parentID) {
        client.setQueryData(postsQueryKey, (oldData) =>
          updatePostCommentsCountInCache(oldData, extractID(newComment.post), 'increment')
        );
        client.setQueryData(postQueryOptions.queryKey, (oldData) =>
          updatePostCommentsCount(oldData, 'increment')
        );
      } else {
        // For replies, we have to update the parent comment's replies count in the cache
        client.setQueryData(commentsQueryKey, (oldData) =>
          updateCommentRepliesCountInCache(oldData, parentID, 'increment')
        );
      }

      return { previousComments, previousPosts, previousParentComments, prevPost };
    },
    onError: (_err, { parent, queryKey }, ctx, { client }) => {
      if (!ctx) return;
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
    onSettled: (_data, _err, { queryKey }, _ctx, { client }) => {
      // Invalidate to ensure fresh data
      client.invalidateQueries({ queryKey });
      client.invalidateQueries(postsInfiniteOptions);
      client.invalidateQueries(commentsInfiniteOptions);
      client.invalidateQueries(postQueryOptions);
    },
  });

  return addMutation;
}
