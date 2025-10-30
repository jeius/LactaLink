import { useMarkSeenTransactionMutation } from '../mutations/useMarkSeenTransactionMutation';
import { useFetchTransactions } from './fetcher';

export function useTransactions() {
  const { queryKey, data, unSeenData, ...queryMethods } = useFetchTransactions();

  const markAsSeenMutation = useMarkSeenTransactionMutation(queryKey);

  function markAsSeen() {
    markAsSeenMutation.mutateAsync(unSeenData);
  }

  return { transactions: data, markAsSeen, unSeenCount: unSeenData.length, queryMethods };
}
