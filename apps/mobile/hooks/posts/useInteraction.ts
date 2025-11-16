import { useMeUser } from '@/hooks/auth/useAuth';
import { InfiniteDataMap } from '@/lib/types';
import {
  createAddCommentMutationKey,
  createDeleteCommentMutationKey,
  createLikeMutationKey,
} from '@/lib/utils/createKeys';
import { extractLikesData } from '@/lib/utils/extractLikesData';
import { getApiClient } from '@lactalink/api';
import { Comment, Like, Post } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { produce } from 'immer';
import { useMemo } from 'react';

type LikedDoc = { relationTo: 'comments' | 'posts'; value: Post | Comment };

type AddComment = Comment & {
  queryKey: QueryKey;
};

export function useLikeInteraction({ relationTo: slug, value: doc }: LikedDoc, queryKey: QueryKey) {
  const { data: user } = useMeUser();
  const profile = user?.profile;

  const queryClient = useQueryClient();

  const docID = doc.id;

  const { likeData: like, likesCount } = useMemo(() => extractLikesData(doc, user), [doc, user]);

  const optimisticUpdate = (data: Like) => {
    queryClient.setQueryData<InfiniteDataMap<Post | Comment>>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      try {
        return produce(oldData, (draft) => {
          for (const page of draft.pages) {
            const doc = page.docs.get(docID);

            if (!doc?.likes) continue;

            const { likeData, likesMap, likesCount } = extractLikesData(doc, user);

            const updateCounter = (count: number) => {
              if (!doc.likes) return;

              doc.likesCount = count;

              // Explicitly check for totalDocs existence since this can be
              // omitted in some queries when count = false
              if ('totalDocs' in doc.likes) {
                doc.likes.totalDocs = count;
              }
            };

            if (likeData && likeData.id === data.id) {
              // Delete operation
              updateCounter(Math.max(likesCount - 1, 0));
              likesMap.delete(likeData.id);
              doc.likes.docs = Array.from(likesMap.values());
            } else {
              // Add operation
              updateCounter(likesCount + 1);
              likesMap.set(data.id, data);
              doc.likes.docs = Array.from(likesMap.values());
            }

            page.docs = new Map(page.docs).set(docID, doc);
            break; // Exit after finding and updating
          }
        });
      } catch (error) {
        console.error('Error updating like data in cache:', error);
        return oldData;
      }
    });
  };

  // Like mutation
  const likeMutation = useMutation({
    mutationKey: createLikeMutationKey({ relationTo: slug, value: docID }),
    meta: {
      errorMessage: (err) => extractErrorMessage(err),
    },
    mutationFn: async () => {
      const apiClient = getApiClient();
      if (like) {
        return apiClient.deleteByID({ collection: 'likes', id: like.id });
      } else {
        return apiClient.create({
          collection: 'likes',
          data: {
            liked: { relationTo: slug, value: docID },
            createdBy: {
              relationTo: profile!.relationTo,
              value: extractID(profile!.value),
            },
          },
        });
      }
    },
    onMutate: () => {
      queryClient.cancelQueries({ queryKey });
      // Snapshot previous values
      const previousData = queryClient.getQueryData<InfiniteDataMap<Post | Comment>>(queryKey);

      if (like) {
        // Optimistically unlike
        optimisticUpdate(like);
      } else {
        // Optimistically like
        optimisticUpdate({
          id: randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          liked: { relationTo: slug, value: docID },
          createdBy: {
            relationTo: profile!.relationTo,
            value: extractID(profile!.value),
          },
        });
      }
      return { previousData };
    },
    onError: (_err, _, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(queryKey, ctx.previousData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    hasLiked: !!like,
    toggleLike: likeMutation.mutate,
    likesCount: likesCount,
    isPending: likeMutation.isPending,
  };
}

export function useAddCommentMutation(queryKey: QueryKey) {
  const queryClient = useQueryClient();
  const { data: meUser } = useMeUser();

  const addMutation = useMutation({
    mutationKey: createAddCommentMutationKey(meUser),
    meta: {
      errorMessage: (err) => extractErrorMessage(err),
    },
    mutationFn: async (data: AddComment) => {
      const apiClient = getApiClient();
      return apiClient.create({
        collection: 'comments',
        data: {
          post: extractID(data.post),
          parent: extractID(data.parent),
          repliedTo: extractID(data.repliedTo),
          content: data.content,
          author: {
            relationTo: data.author.relationTo,
            value: extractID(data.author.value),
          },
        },
      });
    },
    onMutate: ({ queryKey: subQueryKey, ...newComment }) => {
      const rootQueryKey = queryKey;

      // Cancel any outgoing refetches
      queryClient.cancelQueries({ queryKey: [...rootQueryKey, ...subQueryKey] });

      // Snapshot previous values
      const rootComments = queryClient.getQueryData<InfiniteDataMap<Comment>>(rootQueryKey);
      const subComments = queryClient.getQueryData<InfiniteDataMap<Comment>>(subQueryKey);

      // Function to add comment to the appropriate query cache
      const add = (queryKey: QueryKey, newComment: Comment) => {
        queryClient.setQueryData<InfiniteDataMap<Comment>>(queryKey, (oldData) => {
          if (!oldData) return oldData;
          return produce(oldData, (draft) => {
            // If it's a reply, add to the end
            if (newComment.parent) {
              const lastPage = draft.pages.at(-1);
              if (!lastPage) return;

              // Create a new Map from the updated array
              // Add the new comment to the end
              // No need to convert to array since we're just adding to the end
              lastPage.docs = new Map(lastPage.docs).set(newComment.id, newComment);
              lastPage.totalDocs += 1;
            }
            // If it's a root comment, add to the beginning
            else {
              const firstPage = draft.pages[0];
              if (!firstPage) return;

              // Get existing comments as an array
              const arr = Array.from(firstPage.docs.values());
              arr.unshift(newComment); // Add the new comment to the start

              // Create a new Map from the updated array
              firstPage.docs = new Map(arr.map((c) => [c.id, c]));
              firstPage.totalDocs += 1;
            }
          });
        });
      };

      // Optimistically update to the new value
      if (newComment.parent) add(subQueryKey, newComment);
      else add(rootQueryKey, newComment);

      // Return context with previous data for error rollback
      return {
        previousRootComments: { data: rootComments, queryKey: rootQueryKey },
        previousSubComments: { data: subComments, queryKey: subQueryKey },
      };
    },
    onError: (_err, { parent }, ctx) => {
      if (!ctx) return;
      const { previousRootComments, previousSubComments } = ctx;
      if (parent) {
        queryClient.setQueryData(previousRootComments.queryKey, previousRootComments.data);
        queryClient.setQueryData(previousSubComments.queryKey, previousSubComments.data);
      } else {
        queryClient.setQueryData(previousRootComments.queryKey, previousRootComments.data);
      }
    },
    onSuccess: (_data, _vars, ctx) => {
      if (!ctx) return;
      const { previousRootComments, previousSubComments } = ctx;
      queryClient.invalidateQueries({ queryKey: previousSubComments.queryKey });
      queryClient.invalidateQueries({ queryKey: previousRootComments.queryKey });
    },
  });

  return { addComment: addMutation.mutate, isAdding: addMutation.isPending };
}

export function useDeleteCommentMutation(queryKey: QueryKey, keysToInvalidate: QueryKey[] = []) {
  const queryClient = useQueryClient();
  const { data: meUser } = useMeUser();

  const deleteMutation = useMutation({
    mutationKey: createDeleteCommentMutationKey(meUser),
    meta: {
      errorMessage: (err) => extractErrorMessage(err),
    },
    mutationFn: async ({ id }: Comment) => {
      const apiClient = getApiClient();
      return apiClient.deleteByID({ collection: 'comments', id });
    },
    onMutate: ({ id: commentID }) => {
      // Cancel any outgoing refetches
      queryClient.cancelQueries({ queryKey });

      // Snapshot previous values
      const previousData = queryClient.getQueryData<InfiniteDataMap<Comment>>(queryKey);

      // Optimistically remove the comment
      queryClient.setQueryData<InfiniteDataMap<Comment>>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return produce(oldData, (draft) => {
          for (const page of draft.pages) {
            if (page.docs.has(commentID)) {
              page.docs.delete(commentID);
              page.docs = new Map(page.docs); // Recreate Map to trigger reactivity
              page.totalDocs = Math.max(page.totalDocs - 1, 0);
              break;
            }
          }
        });
      });

      // Return context with previous data for error rollback
      return { previousData };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(queryKey, ctx.previousData);
    },
    onSuccess: () => {
      // Invalidate the main query key
      queryClient.invalidateQueries({ queryKey });
      // Invalidate any additional specified keys
      keysToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });

  return { deleteComment: deleteMutation.mutate, isDeleting: deleteMutation.isPending };
}
