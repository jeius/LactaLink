import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { mutationOptions } from '@tanstack/react-query';
import { createPostQueryOptions } from '../queryOptions/postQueryOptions';

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
