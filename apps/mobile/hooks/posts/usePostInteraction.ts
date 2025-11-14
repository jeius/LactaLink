import { useMeUser } from '@/hooks/auth/useAuth';
import { InfiniteDataMap } from '@/lib/types';
import { extractLikesData } from '@/lib/utils/extractLikesData';
import { useApiClient } from '@lactalink/api';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { useRecyclingState } from '@shopify/flash-list';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { useMemo } from 'react';

type ListData = InfiniteDataMap<Post>;

const slug = 'posts';

export function usePostLikeInteraction(post: Post, queryKey: QueryKey) {
  const { data: user } = useMeUser();
  const profile = user?.profile;

  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const postID = post.id;

  const { likeData: like, likesCount } = useMemo(() => extractLikesData(post, user), [post, user]);

  const [hasLiked, setHasLiked] = useRecyclingState(!!like, [postID, like]);
  const [count, setCount] = useRecyclingState(likesCount, [postID, likesCount]);

  // Like mutation
  const likeMutation = useMutation({
    meta: {
      errorMessage: (err) => extractErrorMessage(err),
    },
    mutationFn: async () => {
      if (like) {
        return apiClient.deleteByID({ collection: 'likes', id: like.id });
      } else {
        return apiClient.create({
          collection: 'likes',
          data: {
            liked: { relationTo: slug, value: postID },
            createdBy: {
              relationTo: profile!.relationTo,
              value: extractID(profile!.value),
            },
          },
        });
      }
    },
    onMutate: () => {
      setHasLiked((prev) => !prev);
      setCount((prev) => (hasLiked ? Math.max(prev - 1, 0) : prev + 1));
      return { previousState: { hasLiked, count } };
    },
    onError: (_err, _, ctx) => {
      if (ctx?.previousState) {
        setHasLiked(ctx.previousState.hasLiked);
        setCount(ctx.previousState.count);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ListData>(queryKey, (oldData) => {
        if (!oldData) return oldData;

        return produce(oldData, (draft) => {
          for (const page of draft.pages) {
            const post = page.docs.get(postID);

            if (!post?.likes) continue;

            const { likeData, likesMap, likesCount } = extractLikesData(post, user);

            const updateCounter = (count: number) => {
              if (!post.likes) return;

              post.likesCount = count;

              // Explicitly check for totalDocs existence since this can be
              // omitted in some queries when count = false
              if ('totalDocs' in post.likes) {
                post.likes.totalDocs = count;
              }
            };

            if (likeData && likeData.id === data.id) {
              // Delete operation
              updateCounter(Math.max(likesCount - 1, 0));
              likesMap.delete(likeData.id);
              post.likes.docs = Array.from(likesMap.values());
            } else {
              // Add operation
              updateCounter(likesCount + 1);
              likesMap.set(data.id, data);
              post.likes.docs = Array.from(likesMap.values());
            }

            page.docs = new Map(page.docs).set(postID, post);
            break; // Exit after finding and updating
          }
        });
      });
    },
  });

  return {
    hasLiked,
    toggleLike: likeMutation.mutate,
    likesCount: count,
    isPending: likeMutation.isPending,
  };
}
