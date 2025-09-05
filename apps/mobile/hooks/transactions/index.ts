import { extractID } from '@lactalink/utilities/extractors';
import { useMarkSeenMutation } from '../collections/useMarkSeenMutation';
import { useFetchTransactions } from './fetcher';

export function useTransactions() {
  const { queryKey, data, unSeenData, ...queryMethods } = useFetchTransactions();

  const markAsSeenMutation = useMarkSeenMutation('transactions', queryKey);

  function markAsSeen() {
    markAsSeenMutation.mutateAsync(extractID(unSeenData));
  }

  return { transactions: data, markAsSeen, unSeenCount: unSeenData.length, queryMethods };
}
