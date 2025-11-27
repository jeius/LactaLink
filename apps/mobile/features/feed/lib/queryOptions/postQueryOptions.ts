import { getApiClient } from '@lactalink/api';
import { Post } from '@lactalink/types/payload-generated-types';
import { queryOptions } from '@tanstack/react-query';

export function createPostQueryOptions(id: Post['id'], initialData?: Post) {
  return queryOptions({
    initialData,
    queryKey: ['posts', id],
    queryFn: async () => {
      const apiClient = getApiClient();
      return apiClient.findByID({ collection: 'posts', id, depth: 5 });
    },
  });
}
