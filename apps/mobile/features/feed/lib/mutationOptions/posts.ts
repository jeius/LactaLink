import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@/lib/services';
import { getMeUser } from '@/lib/stores/meUserStore';
import { PostSchema } from '@lactalink/form-schemas';
import { Post } from '@lactalink/types/payload-generated-types';
import { PostError } from '@lactalink/utilities/errors';
import { extractID } from '@lactalink/utilities/extractors';
import { mutationOptions } from '@tanstack/react-query';
import { createPost } from '../api/posts';
import { createPostQueryOptions } from '../queryOptions/posts';

export function createDeletePostMutationOptions(postID: string) {
  return mutationOptions({
    mutationKey: ['delete', 'posts', postID],
    mutationFn: async () => {
      const apiClient = getApiClient();
      return apiClient.deleteByID({ collection: 'posts', id: postID });
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.INFINITE });
      const postQueryKey = createPostQueryOptions(postID).queryKey;
      client.removeQueries({ queryKey: postQueryKey, exact: true });
    },
  });
}

export function createNewPostMutationOptions() {
  return mutationOptions({
    mutationKey: ['create', 'posts', getMeUser()?.id].filter(Boolean),
    mutationFn: async ({ data }: { data: PostSchema }) => {
      return createPost(data);
    },
    onError: async (err) => {
      // If the error is a PostError, it means the post creation failed after uploading images.
      // We should clean up those uploaded images to avoid orphaned files.
      if (err instanceof PostError) {
        const post = err.data as Partial<Post>;

        const imagesToDelete = post.attachments
          ?.map((a) => extractID(a.image))
          .filter(Boolean) as string[];

        await getApiClient().delete({
          collection: 'images',
          where: { id: { in: imagesToDelete } },
        });
      }
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.INFINITE });
    },
  });
}
