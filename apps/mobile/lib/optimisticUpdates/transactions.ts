import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { PaginatedDocs } from '@lactalink/types/payload-generated-types';
import { produce } from 'immer';

/**
 * Optimistically add a delivery proposal to the cache
 */
export function addProposalToCache(
  client: QueryClient,
  transactionId: string,
  proposal: any, // DeliveryProposal type
) {
  // Update proposals query
  client.setQueryData<any[]>(['deliveryProposals', transactionId], (old = []) => {
    return [proposal, ...old];
  });
}

/**
 * Optimistically update a proposal's status in the cache
 */
export function updateProposalInCache(
  client: QueryClient,
  transactionId: string,
  proposalId: string,
  updates: Partial<any>, // Partial<DeliveryProposal>
) {
  client.setQueryData<any[]>(['deliveryProposals', transactionId], (old = []) => {
    return old.map((proposal) =>
      proposal.id === proposalId ? { ...proposal, ...updates } : proposal,
    );
  });
}

/**
 * Optimistically add an agreement to a proposal
 */
export function addAgreementToCache(
  client: QueryClient,
  proposalId: string,
  agreement: any, // ProposalAgreement type
) {
  // Update agreements query for this proposal
  client.setQueryData<any[]>(['proposalAgreements', proposalId], (old = []) => {
    // Check if agreement already exists for this party
    const existing = old.find((a) => a.party === agreement.party);
    if (existing) {
      // Update existing
      return old.map((a) => (a.party === agreement.party ? { ...a, ...agreement } : a));
    }
    // Add new
    return [...old, agreement];
  });
}

/**
 * Optimistically add a transaction event to the cache
 */
export function addEventToCache(
  client: QueryClient,
  transactionId: string,
  event: any, // TransactionEvent type
) {
  // Update events query
  client.setQueryData<InfiniteData<PaginatedDocs<any>>>(
    ['transactionEvents', transactionId],
    (old) => {
      if (!old) return old;

      return produce(old, (draft) => {
        const firstPage = draft.pages[0];
        if (firstPage?.docs) {
          firstPage.docs.unshift(event);
          firstPage.totalDocs = (firstPage.totalDocs || 0) + 1;
        }
      });
    },
  );
}

/**
 * Optimistically update transaction status
 */
export function updateTransactionStatus(
  client: QueryClient,
  transactionId: string,
  newStatus: string,
) {
  // Update transaction detail query
  client.setQueryData<any>(['transactions', transactionId], (old) => {
    if (!old) return old;
    return { ...old, status: newStatus };
  });

  // Update transaction in list query
  client.setQueryData<InfiniteData<PaginatedDocs<any>>>(['transactions'], (old) => {
    if (!old) return old;

    return produce(old, (draft) => {
      for (const page of draft.pages) {
        if (page?.docs) {
          const transaction = page.docs.find((t: any) => t.id === transactionId);
          if (transaction) {
            transaction.status = newStatus;
            break;
          }
        }
      }
    });
  });
}

/**
 * Rollback helper - restore previous query data
 */
export function rollbackQueryData<T>(client: QueryClient, queryKey: any[], previousData: T) {
  if (previousData !== undefined) {
    client.setQueryData(queryKey, previousData);
  }
}

/**
 * Generic optimistic update context type
 */
export interface OptimisticContext<T = any> {
  previous: T;
}

/**
 * Create optimistic context with previous data
 */
export function createOptimisticContext<T>(
  client: QueryClient,
  queryKey: any[],
): OptimisticContext<T> {
  return {
    previous: client.getQueryData<T>(queryKey),
  };
}
