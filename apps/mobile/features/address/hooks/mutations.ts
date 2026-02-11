import { useMeUser } from '@/hooks/auth/useAuth';
import { QUERY_KEYS } from '@/lib/constants';
import { addUserToCache } from '@/lib/utils/cacheUtils';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { useMutation } from '@tanstack/react-query';
import {
  addAddressToAllCaches,
  addAddressToCache,
  invalidateAddressFromAllCaches,
  removeAddressFromAllCaches,
} from '../lib/cacheUtils';
import { createAddress, deleteAddress, updateAddress } from '../lib/mutate';
import { createAddressQuery } from '../lib/queryOptions';

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
  const { data: meUser } = useMeUser();

  return useMutation({
    meta: {
      errorMessage: (error) => extractErrorMessage(error),
      successMessage: ({ address }: { address: Address }) =>
        `Address "${address.name}" deleted successfully.`,
    },
    mutationFn: deleteAddress,
    onMutate: (address, { client }) => {
      // Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      client.cancelQueries({ queryKey: QUERY_KEYS.ADDRESSES.ALL });

      const queryKey = createAddressQuery(address).queryKey;
      const prevData = client.getQueryData(queryKey);

      // Optimistically remove the address from all relevant caches
      if (meUser) removeAddressFromAllCaches(client, address, meUser);

      return { prevData };
    },
    onError: (_error, _vars, ctx, { client }) => {
      if (ctx?.prevData && meUser) {
        // Rollback to the previous data if the mutation fails
        addAddressToAllCaches(client, ctx.prevData, meUser);
      }
    },
    onSuccess: async ({ user }, _vars, _ctx, { client }) => {
      addUserToCache(client, user);
      await client.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES.INFINITE });
    },
  });
}
