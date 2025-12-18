import { storeInfiniteDocuments } from '@/lib/localStorage/utils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser, generatePlaceHoldersWithID } from '@lactalink/utilities';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { addTransactionToCache } from '../lib/cacheUtils';
import { createTransactionInfiniteQuery, createTransactionQuery } from '../lib/queryOptions';
import { updateUnseenTransactionStore } from '../lib/zustandStores/unseenTransactionsStore';

export function useTransaction(transaction: string | Transaction | undefined) {
  return useQuery(createTransactionQuery(transaction));
}

export function useInfiniteTransactions(options?: {
  limit?: number;
  status?: Transaction['status'];
}) {
  const queryClient = useQueryClient();
  const queryOptions = createTransactionInfiniteQuery(options);
  const { data, ...query } = useInfiniteQuery(queryOptions);

  const dataArray = useMemo(() => {
    if (!data) return generatePlaceHoldersWithID(10, {} as Transaction);

    const docs: Transaction[] = [];

    for (const page of data.pages) {
      page.docs.forEach((doc) => {
        docs.push(doc);

        // Add to cache
        addTransactionToCache(queryClient, doc);

        // Update unseen transactions store
        updateUnseenTransactionStore(doc);
      });
    }

    return docs;
  }, [data, queryClient]);

  useEffect(() => {
    const storageKey = createStorageKeyByUser(getMeUser(), queryOptions.queryKey.join('-'));
    if (data) storeInfiniteDocuments(data, storageKey);
  }, [data, queryOptions.queryKey]);

  return { ...query, data: dataArray, dataMap: data };
}
