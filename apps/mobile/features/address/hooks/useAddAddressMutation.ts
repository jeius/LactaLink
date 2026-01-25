import { meUserQueryOptions } from '@/lib/queries/authQueryOptions';
import { createTempID } from '@/lib/utils/tempID';
import { getApiClient } from '@lactalink/api';
import { AddressCreateSchema } from '@lactalink/form-schemas';
import { latLngToPoint } from '@lactalink/utilities/geo-utils';
import { useMutation } from '@tanstack/react-query';
import { produce } from 'immer';

const queryKey = meUserQueryOptions.queryKey;

export function useAddAddressMutation() {
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
    onMutate: async (vars, { client }) => {
      await client.cancelQueries({ queryKey });

      const prevData = client.getQueryData(queryKey);

      client.setQueryData(queryKey, (old) => {
        if (!old) return old;

        return produce(old, (draft) => {
          draft.addresses?.docs?.push({
            ...vars,
            id: createTempID(),
            coordinates: latLngToPoint(vars.coordinates),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
      });

      return { prevData };
    },
    onError: (_err, _vars, ctx, { client }) => {
      if (ctx?.prevData) {
        client.setQueryData(queryKey, ctx.prevData);
      }
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey });
      await client.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}
