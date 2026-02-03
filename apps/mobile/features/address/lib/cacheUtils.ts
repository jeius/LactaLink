import { Address, User } from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { createAddressesInfQuery, createAddressQuery } from './queryOptions';

export function addAddressToCache(client: QueryClient, address: Address) {
  const queryKey = createAddressQuery(address).queryKey;
  client.setQueryData(queryKey, address);
}

export function addAddressToInfiniteCache(
  client: QueryClient,
  address: Address,
  user: string | User
) {
  const queryKey = createAddressesInfQuery(user).queryKey;

  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;

    return produce(oldData, (draft) => {
      for (const page of draft.pages) {
        page.docs = new Map(page.docs).set(address.id, address);
      }
    });
  });
}
