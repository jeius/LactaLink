import { QUERY_KEYS } from '@/lib/constants';
import { getStoredInfiniteDocuments } from '@/lib/localStorage/utils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { transformToInfiniteDataMap } from '@/lib/utils/transformToInfiniteData';
import { DeliveryDetail, Transaction } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import isString from 'lodash/isString';
import {
  fetchDeliveryDetail,
  fetchPaginatedDeliveryPlans,
  fetchPaginatedTransactions,
  fetchTransaction,
} from '../findDocs';

export function createTransactionQuery(transaction: string | Transaction | undefined) {
  const transactionID = extractID(transaction);
  return queryOptions({
    enabled: !!transactionID,
    queryKey: [...QUERY_KEYS.TRANSACTIONS.ONE, transactionID],
    queryFn: () => {
      if (!transactionID) throw new Error('Transaction ID is undefined');

      return fetchTransaction(transactionID);
    },
    placeholderData: extractCollection(transaction) ?? undefined,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  });
}

export function createTransactionInfiniteQuery(options?: {
  limit?: number;
  status?: Transaction['status'];
}) {
  const { limit = 10, status } = options || {};

  const queryKey = [...QUERY_KEYS.TRANSACTIONS.INFINITE];
  if (status) queryKey.push(status);

  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: queryKey,
    queryFn: async ({ pageParam }) => {
      const { docs, ...rest } = await fetchPaginatedTransactions(pageParam, { limit, status });
      return { ...rest, docs: new Map(docs.map((doc) => [doc.id, doc])) };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => {
      if (prev) return prev;
      const storageKey = createStorageKeyByUser(getMeUser(), queryKey.join('-'));
      return getStoredInfiniteDocuments(storageKey);
    },
  });
}

export function createInfiniteDeliveryPlansQuery(transaction: Transaction) {
  const initialPlans = transformToInfiniteDataMap(transaction.deliveryPlans);
  return infiniteQueryOptions({
    initialPageParam: 1,
    queryKey: [...QUERY_KEYS.DELIVERY_PLANS.INFINITE, transaction.id],
    queryFn: async ({ pageParam }) => {
      const { docs, ...res } = await fetchPaginatedDeliveryPlans(transaction.id, pageParam);
      return { ...res, docs: new Map(docs.map((plan) => [plan.id, plan])) };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prev) => {
      if (!prev && initialPlans) return initialPlans;
      return prev;
    },
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  });
}

export function createDeliveryDetailQuery(deliveryDetail?: string | DeliveryDetail | null) {
  const id = extractID(deliveryDetail);
  const initialDoc = extractCollection(deliveryDetail);
  return queryOptions({
    enabled: isString(deliveryDetail) && !!id,
    queryKey: [...QUERY_KEYS.DELIVERY_PLANS.ONE, id],
    queryFn: () => {
      if (!id) throw new Error('Delivery Detail ID is undefined');
      return fetchDeliveryDetail(id);
    },
    placeholderData: (prev) => (!prev && initialDoc ? initialDoc : prev),
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  });
}
