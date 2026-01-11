import { QUERY_KEYS } from '@/lib/constants';
import { getStoredInfiniteDocuments } from '@/lib/localStorage/utils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser } from '@lactalink/utilities';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { fetchPaginatedTransactions, fetchTransaction } from '../findDocs';

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
