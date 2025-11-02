import { useTransactionService } from '@lactalink/api';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMeUser } from '../auth/useAuth';

export function usePreparingMutation(queryKey: unknown[]) {
  const queryClient = useQueryClient();
  const service = useTransactionService();
  const { data: meUser } = useMeUser();
  const meUserProfile = meUser?.profile;

  const mutation = useMutation({
    mutationFn: (transaction: Transaction) => {
      if (!meUserProfile) {
        throw new Error('User profile not found');
      }

      return service.startPreparing(transaction.id, meUserProfile);
    },
    onMutate: async (inputTransaction) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<Transaction>(queryKey);
      if (previousData && meUserProfile) {
        const updatedTransaction = service.optimisticStatusUpdate(
          inputTransaction,
          TRANSACTION_STATUS.MATCHED.value,
          meUserProfile
        );
        queryClient.setQueryData(queryKey, updatedTransaction);
      }
      return { previousData };
    },
    onError: (err, _, context) => {
      console.warn('Error starting preparing mutation:', err);
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  return mutation;
}
