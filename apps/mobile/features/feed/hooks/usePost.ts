import { QUERY_KEYS } from '@/lib/constants';
import { createQueryKey } from '@/lib/utils/createKeys';
import { getApiClient } from '@lactalink/api';
import { Post } from '@lactalink/types/payload-generated-types';
import { useQuery } from '@tanstack/react-query';

export function usePost(id: Post['id'], initialData?: Post) {
  const queryKey = createQueryKey(QUERY_KEYS.POSTS.ONE, [id]);
  return useQuery({
    queryKey,
    initialData,
    queryFn: () => {
      const apiClient = getApiClient();
      return apiClient.findByID({ collection: 'posts', id, depth: 5 });
    },
  });
}
