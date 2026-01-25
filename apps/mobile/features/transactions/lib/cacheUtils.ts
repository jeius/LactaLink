import { DeliveryDetail, Transaction } from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import {
  createDeliveryDetailQuery,
  createTransactionInfiniteQuery,
  createTransactionQuery,
} from './queryOptions';

export function addTransactionToAllCache(client: QueryClient, transaction: Transaction) {
  addTransactionToInfiniteCache(client, transaction);
  addTransactionToCache(client, transaction);
}

export function addTransactionToCache(client: QueryClient, transaction: Transaction) {
  const queryKey = createTransactionQuery(transaction).queryKey;
  client.setQueryData(queryKey, transaction);
}

export function addTransactionToInfiniteCache(client: QueryClient, transaction: Transaction) {
  const queryKey = createTransactionInfiniteQuery().queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;

    return produce(oldData, (draft) => {
      for (const page of draft.pages) {
        const exists = page.docs.has(transaction.id);
        if (exists) {
          // Replace existing transaction
          page.docs = new Map(page.docs).set(transaction.id, transaction);
          break;
        } else {
          // Add new transaction at the beginning
          const array = Array.from(page.docs.values());
          array.unshift(transaction);
          page.docs = new Map(array.map((doc) => [doc.id, doc]));
          break;
        }
      }
    });
  });
}

export function addDeliveryDetailToCache(
  client: QueryClient,
  deliveryDetail: DeliveryDetail | undefined
) {
  const queryKey = createDeliveryDetailQuery(deliveryDetail).queryKey;
  client.setQueryData(queryKey, deliveryDetail);
}
