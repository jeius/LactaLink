import { useHomeTabsBadgeStore } from '@/lib/stores/homeTabBadgeStore';
import { extractID } from '@lactalink/utilities/extractors';
import { useEffect } from 'react';
import { useFetchTransactions } from './fetcher';

export function useTransactions() {
  const { queryKey: _, data, newData, ...queryMethods } = useFetchTransactions();

  useEffect(() => {
    const { pushNewTransactionID } = useHomeTabsBadgeStore.getState();
    pushNewTransactionID(extractID(newData));
  }, [newData]);

  return { transactions: data, newData, queryMethods };
}
