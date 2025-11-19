import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { Address, User } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';

const queryKey = QUERY_KEYS.AUTH.USER;

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      invalidatesQuery: queryKey,
      errorMessage: (err) => {
        const msg = extractErrorMessage(err);
        return `Failed to delete address: ${msg}`;
      },
    },
    mutationFn: (data: string | Address) => {
      const apiClient = getApiClient();
      return apiClient.deleteByID({
        collection: 'addresses',
        id: extractID(data),
      });
    },
    onMutate: (vars) => {
      queryClient.cancelQueries({ queryKey });
      const prevData = queryClient.getQueryData<User>(queryKey);
      queryClient.setQueryData<User>(queryKey, (old) => {
        if (!old) return old;

        return produce(old, (draft) => {
          if (draft.addresses?.docs) {
            draft.addresses.docs = draft.addresses.docs.filter(
              (address) => extractID(address) !== extractID(vars)
            );
          }
        });
      });
      return { prevData };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevData) {
        queryClient.setQueryData<User>(queryKey, context.prevData);
      }
    },
  });
}
