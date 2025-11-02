import { TransactionStatus } from '@lactalink/types';
import type { FindMany, FindManyResult } from '@lactalink/types/api';
import type {
  ConfirmedDelivery,
  DeliveryAgreements,
  Donation,
  MilkBag,
  ProposedDelivery,
  Request,
  Transaction,
  User,
} from '@lactalink/types/payload-generated-types';
import type { SelectFromCollectionSlug } from '@lactalink/types/payload-types';

/**
 * Parameters for updating delivery details.
 */
export interface DeliveryDetailsParams
  extends Omit<
    NonNullable<ProposedDelivery>[number],
    'address' | 'agreements' | 'proposedAt' | 'id'
  > {
  /**
   * Address ID for the delivery
   */
  address: string;
}

type BaseTransactionParams = {
  milkBags: (string | MilkBag)[];
  donation: string | Donation;
  request: string | Request;
};

type OrganizationTransactionParams = Pick<
  DeliveryDetailsParams,
  'datetime' | 'address' | 'instructions'
> & {
  organization: Exclude<NonNullable<User['profile']>, { relationTo: 'individuals' }>;
};

/**
 * Parameters for creating a P2P transaction.
 */
export type CreateP2PTransactionParams = BaseTransactionParams & {
  delivery?: Omit<ConfirmedDelivery, 'address'> & { address: string };
};

/**
 * Parameters for creating a P2O transaction.
 */
export type CreateP2OTransactionParams = Omit<BaseTransactionParams, 'request'> &
  OrganizationTransactionParams;

/**
 * Parameters for creating an O2P transaction.
 */
export type CreateO2PTransactionParams = Omit<BaseTransactionParams, 'donation'> &
  OrganizationTransactionParams;

/**
 * Service for managing transactions throughout their lifecycle.
 * Handles creation, status updates, delivery scheduling, and completion.
 */
export interface ITransactionService {
  /**
   * Creates a new P2P (Peer to Peer) transaction between donor and requester.
   * @param params - Transaction parameters
   * @returns The created transaction
   */
  createP2PTransaction(params: CreateP2PTransactionParams): Promise<Transaction>;

  /**
   * Creates a new P2O (Peer to Organization) transaction.
   * For donations directly to an organization with fixed DELIVERY mode.
   * @param params - Transaction parameters
   * @returns The created transaction
   */
  createP2OTransaction(params: CreateP2OTransactionParams): Promise<Transaction>;

  /**
   * Creates a new O2P (Organization to Peer) transaction.
   * For organization fulfilling a request with fixed PICKUP mode.
   * @param params - Transaction parameters
   * @returns The created transaction
   */
  createO2PTransaction(params: CreateO2PTransactionParams): Promise<Transaction>;

  /**
   * Proposes delivery option for a transaction, initiating the negotiation process.
   * @param transactionId - ID of the transaction
   * @param details - Delivery details
   * @returns Updated transaction
   */
  proposeDeliveryOption(
    transactionId: string,
    details: DeliveryDetailsParams
  ): Promise<Transaction>;

  /**
   * Accepts proposed delivery proposal and schedules the delivery.
   * @param transactionID - ID of the transaction
   * @param proposalID - ID of the proposal
   * @param acceptedBy - User profile accepting the proposal
   * @returns Updated transaction
   */
  acceptDeliveryProposal(
    transactionID: string,
    proposalID: string,
    acceptedBy: NonNullable<User['profile']>
  ): Promise<Transaction>;

  /**
   * Rejects proposed delivery proposal.
   * @param transactionID - ID of the transaction
   * @param proposalID - ID of the proposal
   * @param rejectedBy - User profile rejecting the proposal
   * @returns Updated transaction
   */
  rejectDeliveryProposal(
    transactionID: string,
    proposalID: string,
    rejectedBy: NonNullable<User['profile']>
  ): Promise<Transaction>;

  /**
   * Updates the transaction status to READY_FOR_PICKUP (donor confirms milk is ready).
   * Only applicable for PICKUP mode transactions.
   * @param transactionId - ID of the transaction
   * @param markedBy - User marking the transaction as ready
   * @returns Updated transaction
   */
  readyForPickup(
    transactionId: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction>;

  /**
   * Updates the transaction status to PREPARING (sender starts preparing milk for transfer).
   * @param transactionId ID of the transaction
   * @param markedBy User marking the transaction as preparing
   * @returns Updated transaction
   */
  startPreparing(
    transactionId: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction>;

  /**
   * Updates the transaction status to IN_TRANSIT (donor starts delivery journey).
   * Only applicable for DELIVERY mode transactions.
   * @param transactionId - ID of the transaction
   * @param markedBy - User marking the transaction as in transit
   * @returns Updated transaction
   */
  startTransit(transactionId: string, markedBy: NonNullable<User['profile']>): Promise<Transaction>;

  /**
   * Applicable for MEETUP mode transactions when involved parties arrive at meetup point.
   * @param transactionId - ID of the transaction
   * @param markedBy - User that arrived at the location.
   * @returns Updated transaction
   */
  markArrived(transactionId: string, markedBy: NonNullable<User['profile']>): Promise<Transaction>;

  /**
   * Marks the transaction as DELIVERED (milk physically transferred).
   * @param transactionId - ID of the transaction
   * @param markedBy - User marking the transaction as delivered
   * @returns Updated transaction
   */
  markDelivered(
    transactionId: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction>;

  /**
   * Completes the transaction (recipient verifies receipt and quality).
   * Only the recipient can complete a transaction.
   * @param transactionId - ID of the transaction
   * @param markedBy - User marking the transaction as complete
   * @returns Updated transaction
   */
  completeTransaction(
    transactionId: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction>;

  /**
   * Marks a transaction as failed with a reason.
   * @param transactionId - ID of the transaction
   * @param reason - Reason for failure
   * @param markedBy - User marking the transaction as failed
   * @returns Updated transaction
   */
  failTransaction(
    transactionId: string,
    reason: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction>;

  /**
   * Cancels a transaction with a reason.
   * @param transactionId - ID of the transaction
   * @param reason - Reason for cancellation
   * @param markedBy - User marking the transaction as cancelled
   * @returns Updated transaction
   */
  cancelTransaction(
    transactionId: string,
    reason: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction>;

  /**
   * Gets all paginated transactions for a user (as donor or requester).
   * @param profile - User profile (Individual, Hospital, or Milk Bank)
   * @param options - Optional query parameters
   * @returns List of paginated transactions
   */
  getUserTransactions<
    TSelect extends
      SelectFromCollectionSlug<'transactions'> = SelectFromCollectionSlug<'transactions'>,
    TPaginate extends boolean = boolean,
  >(
    options?: FindMany<'transactions', TSelect, TPaginate>
  ): Promise<FindManyResult<'transactions', TSelect, TPaginate>>;

  /**
   *
   * @param transaction - Transaction document
   * @param proposalID - ID of the proposal
   * @param agreement - Agreement details
   * @returns Updated proposed delivery
   */
  optimisticAgreementsUpdate(
    transaction: Transaction,
    proposalID: string,
    agreement: DeliveryAgreements['sender']
  ): NonNullable<ProposedDelivery>;

  /**
   * Optimistically updates the transaction status in the local cache.
   * @param transaction - Transaction document
   * @param newStatus - New status to set
   * @param markedBy - User profile marking the status change
   * @param reason - Optional reason for status change
   * @returns Updated transaction with new status and statusy history
   */
  optimisticStatusUpdate(
    transaction: Transaction,
    newStatus: TransactionStatus,
    markedBy: NonNullable<User['profile']>,
    reason?: string
  ): Transaction;
}
