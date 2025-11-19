import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { AddressCreateSchema } from '@lactalink/form-schemas';
import { User } from '@lactalink/types/payload-generated-types';
import { latLngToPoint } from '@lactalink/utilities/geo-utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { produce } from 'immer';

const queryKey = QUERY_KEYS.AUTH.USER;

export function useAddAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { invalidatesQuery: queryKey },
    mutationFn: (data: AddressCreateSchema) => {
      const apiClient = getApiClient();
      const { coordinates, ...rest } = data;
      return apiClient.create({
        collection: 'addresses',
        data: {
          ...rest,
          coordinates: latLngToPoint(coordinates),
        },
      });
    },
    onMutate: (vars) => {
      queryClient.cancelQueries({ queryKey });
      const prevData = queryClient.getQueryData<User>(queryKey);
      queryClient.setQueryData<User>(queryKey, (old) => {
        if (!old) return old;

        return produce(old, (draft) => {
          draft.addresses?.docs?.push({
            ...vars,
            id: 'temp-' + randomUUID(),
            coordinates: latLngToPoint(vars.coordinates),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
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
