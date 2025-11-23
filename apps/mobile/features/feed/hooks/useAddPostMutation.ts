import { QUERY_KEYS } from '@/lib/constants';
import { InfiniteDataMap } from '@/lib/types';
import { useApiClient } from '@lactalink/api';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPostToCache } from '../lib/postCacheUtils';

export function useAddPostMutation() {
  const queryClient = useQueryClient();
  const apiClient = useApiClient();

  const queryKey = QUERY_KEYS.POSTS.INFINITE;

  return useMutation({
    meta: { invalidatesQuery: queryKey },
    mutationFn: async (newPost: Post) => {
      return apiClient.create({
        collection: 'posts',
        data: {
          title: newPost.title,
          content: newPost.content,
          attachments: newPost.attachments,
          sharedFrom: newPost.sharedFrom,
          tags: newPost.tags,
          visibility: newPost.visibility,
          author: { relationTo: newPost.author.relationTo, value: extractID(newPost.author.value) },
        },
      });
    },
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey });
      const prevPost = queryClient.getQueryData<InfiniteDataMap<Post>>(queryKey);
      queryClient.setQueryData<InfiniteDataMap<Post>>(queryKey, (oldData) =>
        addPostToCache(oldData, newPost)
      );
      return { prevPost };
    },
    onError: async (_err, { attachments }, context) => {
      if (context?.prevPost) {
        queryClient.setQueryData<InfiniteDataMap<Post>>(queryKey, context.prevPost);
      }
      if (attachments) {
        // Clean up uploaded attachments if mutation fails
        const ids = attachments.map((att) => extractID(att.image)).filter(Boolean) as string[];
        await apiClient.delete({
          collection: 'images',
          where: { id: { in: ids } },
        });
      }
    },
  });
}
