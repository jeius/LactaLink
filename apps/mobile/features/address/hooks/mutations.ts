import { addUserToCache } from '@/lib/utils/cacheUtils';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { useMutation } from '@tanstack/react-query';
import { addAddressToAllCaches, removeAddressFromAllCaches } from '../lib/cacheUtils';
import { createAddress, deleteAddress, updateAddress } from '../lib/mutate';

export function useAddAddressMutation() {
  return useMutation({
    meta: { errorMessage: (error) => extractErrorMessage(error) },
    mutationFn: createAddress,
    onSuccess: async ({ user, address }, _vars, _ctx, { client }) => {
      addUserToCache(client, user);
      if (user) addAddressToAllCaches(client, address, user);
    },
  });
}

export function useUpdateAddressMutation() {
  return useMutation({
    meta: { errorMessage: (error) => extractErrorMessage(error) },
    mutationFn: updateAddress,
    onSuccess: async ({ user, address }, _vars, _ctx, { client }) => {
      addUserToCache(client, user);
      if (user) addAddressToAllCaches(client, address, user);
    },
  });
}

export function useDeleteAddressMutation() {
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: async ({ user, address }, _vars, _ctx, { client }) => {
      addUserToCache(client, user);
      if (user) removeAddressFromAllCaches(client, address, user);
    },
  });
}
