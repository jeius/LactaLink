import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { AddressSchema } from '@lactalink/form-schemas';
import { Address, User } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { latLngToPoint } from '@lactalink/utilities/geo-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { produce, WritableDraft } from 'immer';

const queryKey = QUERY_KEYS.AUTH.USER;

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { invalidatesQuery: queryKey },
    mutationFn: (data: Partial<Omit<AddressSchema, 'id'>> & Pick<AddressSchema, 'id'>) => {
      const apiClient = getApiClient();
      const { coordinates, id, ...rest } = data;
      return apiClient.updateByID({
        collection: 'addresses',
        id: id,
        data: {
          ...rest,
          coordinates: coordinates && latLngToPoint(coordinates),
        },
      });
    },
    onMutate: (vars) => {
      queryClient.cancelQueries({ queryKey });
      const prevData = queryClient.getQueryData<User>(queryKey);
      queryClient.setQueryData<User>(queryKey, (old) => {
        if (!old) return old;

        return produce(old, (draft) => {
          const docs = draft.addresses?.docs;
          if (!docs) return;
          const index = docs.findIndex((address) => extractID(address) === vars.id);

          if (index !== -1 && areAddresses(docs)) {
            const doc: Partial<Address> = {
              ...vars,
              coordinates: vars.coordinates && latLngToPoint(vars.coordinates),
              updatedAt: new Date().toISOString(),
            };
            docs[index] = doc as WritableDraft<Address>;
            draft.addresses!.docs = docs;
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

function areAddresses(arr: (string | Address)[]): arr is WritableDraft<Address>[] {
  return arr.every((item) => typeof item !== 'string');
}
