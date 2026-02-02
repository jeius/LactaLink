import { storeInfiniteDocuments } from '@/lib/localStorage/utils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { DeliveryDetail, Transaction } from '@lactalink/types/payload-generated-types';
import { createStorageKeyByUser, generatePlaceHoldersWithID } from '@lactalink/utilities';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { addTransactionToCache } from '../lib/cacheUtils';
import {
  createDeliveryDetailQuery,
  createTransactionInfiniteQuery,
  createTransactionQuery,
} from '../lib/queryOptions';

export function useTransaction(transaction: string | Transaction | undefined) {
  return useQuery(createTransactionQuery(transaction));
}

export function useDeliveryDetail(deliveryDetail: string | DeliveryDetail | null | undefined) {
  return useQuery(createDeliveryDetailQuery(deliveryDetail));
}

export function useInfiniteTransactions(options?: {
  limit?: number;
  status?: Transaction['status'];
}) {
  const queryClient = useQueryClient();
  const queryOptions = createTransactionInfiniteQuery(options);
  const { data, ...query } = useInfiniteQuery(queryOptions);

  const { docs, unseen } = useMemo(() => {
    if (!data)
      return {
        docs: generatePlaceHoldersWithID(10, {} as Transaction),
        unseen: [],
      };

    const docs: Transaction[] = [];
    const unseen: Transaction[] = [];

    for (const page of data.pages) {
      page.docs.forEach((doc) => {
        docs.push(doc);

        // Add to cache
        addTransactionToCache(queryClient, doc);

        const isUnseen = doc.tracking?.reads?.docs?.length === 0;
        if (isUnseen) unseen.push(doc);
      });
    }

    return { docs, unseen };
  }, [data, queryClient]);

  useEffect(() => {
    const storageKey = createStorageKeyByUser(getMeUser(), queryOptions.queryKey.join('-'));
    if (data) storeInfiniteDocuments(data, storageKey);
  }, [data, queryOptions.queryKey]);

  return { ...query, data: docs, dataMap: data, unseen };
}

export function useInfiniteDeliveries() {
  return useInfiniteTransactions({ status: TRANSACTION_STATUS.IN_TRANSIT.value });
}
