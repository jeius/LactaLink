import { useTransactionService } from '@lactalink/api';
import { Transaction, User } from '@lactalink/types/payload-generated-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMeUser } from '../auth/useAuth';

/**
 * Configuration for delivery proposal mutations
 */
type ProposalMutationConfig = {
  agreed: boolean;
  actionName: string;
  mutationFn: (
    transactionService: ReturnType<typeof useTransactionService>,
    transactionId: string,
    proposalId: string,
    userProfile: NonNullable<User['profile']>
  ) => Promise<Transaction>;
};

/**
 * Context for optimistic updates
 */
type MutationContext = {
  previousTransaction: Transaction;
};

export function useDeliveryMutations(transaction: Transaction, queryKey: unknown[]) {
  const queryClient = useQueryClient();
  const transactionService = useTransactionService();
  const { data: meUser } = useMeUser();

  /**
   * Validates user profile and throws error if not found
   */
  const validateUserProfile = () => {
    const userProfile = meUser?.profile;
    if (!userProfile) throw new Error('User profile not found');
    return userProfile;
  };

  /**
   * Performs optimistic update for proposal agreement/disagreement
   */
  const performOptimisticUpdate = async (proposalId: string, agreed: boolean) => {
    const userProfile = validateUserProfile();

    await queryClient.cancelQueries({ queryKey });

    const updatedProposals = transactionService.updateProposalAgreements(transaction, proposalId, {
      agreed,
      agreedAt: new Date().toISOString(),
      agreedBy: userProfile,
    });

    queryClient.setQueryData<Transaction | undefined>(queryKey, (old) =>
      old ? { ...old, delivery: { ...old.delivery, proposedDelivery: updatedProposals } } : old
    );

    return { previousTransaction: transaction };
  };

  /**
   * Handles mutation errors by reverting optimistic updates
   */
  const handleMutationError = (
    error: unknown,
    proposalId: string,
    context: MutationContext | undefined,
    actionName: string
  ) => {
    console.warn(`Error ${actionName} delivery proposal ${proposalId}:`, error);
    if (context?.previousTransaction) {
      queryClient.setQueryData<Transaction | undefined>(queryKey, context.previousTransaction);
    }
  };

  /**
   * Creates a generic mutation for proposal actions
   */
  const useProposalMutation = (config: ProposalMutationConfig) => {
    return useMutation({
      mutationFn: async (proposalID: string) => {
        const userProfile = validateUserProfile();
        return config.mutationFn(transactionService, transaction.id, proposalID, userProfile);
      },
      onMutate: (proposalID: string) => performOptimisticUpdate(proposalID, config.agreed),
      onError: (error, proposalID, context) =>
        handleMutationError(error, proposalID, context, config.actionName),
      onSuccess: (data) => {
        queryClient.setQueryData(queryKey, data);
      },
    });
  };

  // Create specific mutations using the generic factory
  const agreeMutation = useProposalMutation({
    agreed: true,
    actionName: 'agreeing to',
    mutationFn: (service, transactionId, proposalId, userProfile) =>
      service.acceptDeliveryProposal(transactionId, proposalId, userProfile),
  });

  const disagreeMutation = useProposalMutation({
    agreed: false,
    actionName: 'disagreeing to',
    mutationFn: (service, transactionId, proposalId, userProfile) =>
      service.rejectDeliveryProposal(transactionId, proposalId, userProfile),
  });

  return { agreeMutation, disagreeMutation };
}
