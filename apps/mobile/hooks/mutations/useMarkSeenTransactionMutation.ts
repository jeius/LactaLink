import { markSeenTransaction } from '@/lib/api/markSeen';
import { useApiClient } from '@lactalink/api';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { PaginatedDocs } from '@lactalink/types/payload-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

type ListData = InfiniteData<PaginatedDocs<Transaction>>;

export function useMarkSeenTransactionMutation(queryKey: unknown[]) {
  const queryClient = useQueryClient();
  const apiClient = useApiClient();

  const mutation = useMutation({
    mutationFn: (input: Transaction | Transaction[]) => {
      const updated = markSeenTransaction(input);
      return Promise.all(
        updated.map((tx) =>
          apiClient.updateByID({
            collection: 'transactions',
            id: tx.id,
            data: { tracking: { seenStatus: tx.seenStatus } },
            depth: 5,
          })
        )
      );
    },
    onMutate: async (inputData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<ListData>(queryKey);
      if (previousData) {
        const updatedData = applyOptimisticUpdate(previousData, inputData);
        if (updatedData) {
          queryClient.setQueryData(queryKey, updatedData);
        }
      }
      return { previousData };
    },
    onSuccess: (updatedData) => {
      if (!updatedData?.length) return;

      queryClient.setQueryData<ListData>(queryKey, (oldData) =>
        oldData ? applyServerUpdate(oldData, updatedData) : oldData
      );
    },
    onError: (err, _, ctx) => {
      const message = extractErrorMessage(err);
      console.warn(`Failed to mark transaction(s) as seen: ${message}`);
      queryClient.setQueryData(queryKey, ctx?.previousData);
    },
  });

  return mutation;
}

// Helper function for optimistic updates
function applyOptimisticUpdate(
  oldData: ListData,
  inputData: Transaction | Transaction[]
): ListData | undefined {
  const updated = markSeenTransaction(inputData);
  const updatedMap = new Map(updated.map((d) => [d.id, d.seenStatus]));

  const newPages = oldData.pages.map((page) => ({
    ...page,
    docs: page.docs.map((item) => {
      const seenStatus = updatedMap.get(item.id);
      return seenStatus ? { ...item, tracking: { ...item.tracking, seenStatus } } : item;
    }),
  }));

  return { ...oldData, pages: newPages };
}

// Helper function for server updates
function applyServerUpdate(oldData: ListData, updatedData: Transaction[]): ListData {
  const updatedDataMap = new Map(updatedData.map((d) => [d.id, d]));

  const newPages = oldData.pages.map((page) => ({
    ...page,
    docs: page.docs.map((item) => updatedDataMap.get(item.id) || item),
  }));

  return { ...oldData, pages: newPages };
}
