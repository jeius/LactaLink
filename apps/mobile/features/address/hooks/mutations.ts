import { QUERY_KEYS } from '@/lib/constants';
import { addUserToCache } from '@/lib/utils/cacheUtils';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { useMutation } from '@tanstack/react-query';
import { addAddressToCache, invalidateAddressFromAllCaches } from '../lib/cacheUtils';
import { createAddress, deleteAddress, updateAddress } from '../lib/mutate';

export function useAddAddressMutation() {
  return useMutation({
    meta: { errorMessage: (error) => extractErrorMessage(error) },
    mutationFn: createAddress,
    onSuccess: async ({ user, address }, _vars, _ctx, { client }) => {
      addUserToCache(client, user);
      addAddressToCache(client, address);
      await client.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES.INFINITE });
    },
  });
}

export function useUpdateAddressMutation() {
  return useMutation({
    meta: { errorMessage: (error) => extractErrorMessage(error) },
    mutationFn: updateAddress,
    onSuccess: async ({ user, address }, _vars, _ctx, { client }) => {
      addUserToCache(client, user);
      await invalidateAddressFromAllCaches(client, address);
    },
  });
}

export function useDeleteAddressMutation() {
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: async ({ user }, _vars, _ctx, { client }) => {
      addUserToCache(client, user);
      await client.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES.INFINITE });
    },
  });
}
