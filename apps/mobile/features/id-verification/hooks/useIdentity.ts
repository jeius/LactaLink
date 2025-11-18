import { useMeUser } from '@/hooks/auth/useAuth';
import { createCollectionQueryKey } from '@/lib/utils/createKeys';
import { getApiClient } from '@lactalink/api';
import { Identity } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { useQuery } from '@tanstack/react-query';

export function useIdentityQuery(onSuccess?: (data: Identity) => void) {
  const { data: user } = useMeUser();
  const profileID = extractID(user?.profile?.value);

  const queries = {
    pagination: false,
    limit: 1,
    where: { submittedBy: { equals: profileID } },
  } as const;
  const queryKey = createCollectionQueryKey('identities', queries);

  const query = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const apiClient = getApiClient();
      const docs = await apiClient.find({
        ...queries,
        collection: 'identities',
      });

      const identity = docs[0];
      if (!identity) return null;
      onSuccess?.(identity);
      return identity;
    },
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  });

  return { ...query, queryKey };
}
