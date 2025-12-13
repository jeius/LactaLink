import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getMeUser } from '@/lib/stores/meUserStore';
import {
  addProposalToCache,
  updateProposalInCache,
  addAgreementToCache,
  addEventToCache,
  updateTransactionStatus,
  createOptimisticContext,
  rollbackQueryData,
} from '@/lib/optimisticUpdates/transactions';

interface ProposeDeliveryData {
  mode: string;
  datetime: string;
  address?: string;
  instructions?: string;
}

interface TransactionCommand {
  type: string;
  [key: string]: unknown;
}

/**
 * Mutation to propose a delivery option
 */
export function useProposeDeliveryMutation(transactionId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (proposalData: ProposeDeliveryData) => {
      const response = await fetch(`/api/transactions/${transactionId}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: { type: 'ProposeDelivery', proposalData },
        }),
      });
      if (!response.ok) throw new Error('Failed to propose delivery');
      return response.json();
    },

    onMutate: async (proposalData) => {
      const meUser = getMeUser();

      // Cancel outgoing queries
      await client.cancelQueries({ queryKey: ['deliveryProposals', transactionId] });

      // Create optimistic proposal
      const optimisticProposal = {
        id: `temp-${Date.now()}`,
        transaction: transactionId,
        mode: proposalData.mode,
        datetime: proposalData.datetime,
        address: proposalData.address,
        instructions: proposalData.instructions,
        proposedBy: meUser?.profile?.value?.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Add to cache optimistically
      addProposalToCache(client, transactionId, optimisticProposal);

      // Create optimistic event
      const optimisticEvent = {
        id: `temp-event-${Date.now()}`,
        transaction: transactionId,
        type: 'DeliveryProposed',
        payload: { proposalId: optimisticProposal.id, ...proposalData },
        actor: meUser?.profile?.value?.id,
        timestamp: new Date().toISOString(),
      };

      addEventToCache(client, transactionId, optimisticEvent);

      return createOptimisticContext(client, ['deliveryProposals', transactionId]);
    },

    onError: (error, variables, context) => {
      if (context) {
        rollbackQueryData(client, ['deliveryProposals', transactionId], context.previous);
      }
    },

    onSettled: () => {
      client.invalidateQueries({ queryKey: ['deliveryProposals', transactionId] });
      client.invalidateQueries({ queryKey: ['transactionEvents', transactionId] });
    },
  });
}

/**
 * Mutation to agree to a delivery proposal
 */
export function useAgreeToProposalMutation(transactionId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await fetch(`/api/transactions/${transactionId}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: { type: 'AgreeToProposal', proposalId },
        }),
      });
      if (!response.ok) throw new Error('Failed to agree to proposal');
      return response.json();
    },

    onMutate: async (proposalId) => {
      const meUser = getMeUser();
      await client.cancelQueries({ queryKey: ['proposalAgreements', proposalId] });

      // Create optimistic agreement
      const optimisticAgreement = {
        id: `temp-${Date.now()}`,
        proposal: proposalId,
        party: meUser?.profile?.value?.id,
        agreed: true,
        agreedAt: new Date().toISOString(),
      };

      addAgreementToCache(client, proposalId, optimisticAgreement);

      // Add optimistic event
      const optimisticEvent = {
        id: `temp-event-${Date.now()}`,
        transaction: transactionId,
        type: 'ProposalAccepted',
        payload: { proposalId },
        actor: meUser?.profile?.value?.id,
        timestamp: new Date().toISOString(),
      };

      addEventToCache(client, transactionId, optimisticEvent);

      return createOptimisticContext(client, ['proposalAgreements', proposalId]);
    },

    onError: (error, proposalId, context) => {
      if (context) {
        rollbackQueryData(client, ['proposalAgreements', proposalId], context.previous);
      }
    },

    onSettled: (data, error, proposalId) => {
      client.invalidateQueries({ queryKey: ['proposalAgreements', proposalId] });
      client.invalidateQueries({ queryKey: ['deliveryProposals', transactionId] });
      client.invalidateQueries({ queryKey: ['transactionEvents', transactionId] });
      client.invalidateQueries({ queryKey: ['transactions', transactionId] });
    },
  });
}

/**
 * Mutation to reject a delivery proposal
 */
export function useRejectProposalMutation(transactionId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, reason }: { proposalId: string; reason?: string }) => {
      const response = await fetch(`/api/transactions/${transactionId}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: { type: 'RejectProposal', proposalId, reason },
        }),
      });
      if (!response.ok) throw new Error('Failed to reject proposal');
      return response.json();
    },

    onMutate: async ({ proposalId }) => {
      await client.cancelQueries({ queryKey: ['deliveryProposals', transactionId] });

      // Update proposal status optimistically
      updateProposalInCache(client, transactionId, proposalId, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
      });

      return createOptimisticContext(client, ['deliveryProposals', transactionId]);
    },

    onError: (error, variables, context) => {
      if (context) {
        rollbackQueryData(client, ['deliveryProposals', transactionId], context.previous);
      }
    },

    onSettled: () => {
      client.invalidateQueries({ queryKey: ['deliveryProposals', transactionId] });
      client.invalidateQueries({ queryKey: ['transactionEvents', transactionId] });
    },
  });
}

/**
 * Generic mutation for transaction commands that change status
 */
export function useTransactionCommandMutation(transactionId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (command: TransactionCommand) => {
      const response = await fetch(`/api/transactions/${transactionId}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (!response.ok) throw new Error('Command failed');
      return response.json();
    },

    onMutate: async (command) => {
      const meUser = getMeUser();
      await client.cancelQueries({ queryKey: ['transactions', transactionId] });

      // Map command types to status changes
      const statusMap: Record<string, string> = {
        StartPreparing: 'READY_FOR_PICKUP',
        StartTransit: 'IN_TRANSIT',
        MarkDelivered: 'DELIVERED',
        CompleteTransaction: 'COMPLETED',
        FailTransaction: 'FAILED',
        CancelTransaction: 'CANCELLED',
      };

      const newStatus = statusMap[command.type];
      if (newStatus) {
        updateTransactionStatus(client, transactionId, newStatus);
      }

      // Add optimistic event
      const optimisticEvent = {
        id: `temp-event-${Date.now()}`,
        transaction: transactionId,
        type: command.type,
        payload: command,
        actor: meUser?.profile?.value?.id,
        timestamp: new Date().toISOString(),
      };

      addEventToCache(client, transactionId, optimisticEvent);

      return createOptimisticContext(client, ['transactions', transactionId]);
    },

    onError: (error, variables, context) => {
      if (context) {
        rollbackQueryData(client, ['transactions', transactionId], context.previous);
      }
    },

    onSettled: () => {
      client.invalidateQueries({ queryKey: ['transactions', transactionId] });
      client.invalidateQueries({ queryKey: ['transactionEvents', transactionId] });
    },
  });
}
