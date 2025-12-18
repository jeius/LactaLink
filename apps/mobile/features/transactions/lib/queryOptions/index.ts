import { QUERY_KEYS } from '@/lib/constants';
import { getStoredInfiniteDocuments } from '@/lib/localStorage/utils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { addTransactionToCache } from '../cacheUtils';
import { fetchPaginatedTransactions, fetchTransaction } from '../findDocs';
import { updateUnseenTransactionStore } from '../zustandStores/unseenTransactionsStore';

export function createTransactionQuery(transaction: string | Transaction | undefined) {
  const transactionID = extractID(transaction);
  return queryOptions({
    enabled: !!transactionID,
    queryKey: [...QUERY_KEYS.TRANSACTIONS.ONE, transactionID],
    queryFn: async () => {
      if (!transactionID) throw new Error('Transaction ID is undefined');

      const doc = await fetchTransaction(transactionID);

      // Update unseen transactions store
      updateUnseenTransactionStore(doc);

      return doc;
    },
    placeholderData: extractCollection(transaction) ?? undefined,
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
    queryFn: async ({ pageParam, client }) => {
      const { docs, ...rest } = await fetchPaginatedTransactions(pageParam, { limit, status });

      const map = new Map<string, Transaction>();

      docs.forEach((doc) => {
        map.set(doc.id, doc);

        // Add to cache
        addTransactionToCache(client, doc);

        // Update unseen transactions store
        updateUnseenTransactionStore(doc);
      });

      return { ...rest, docs: map };
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
