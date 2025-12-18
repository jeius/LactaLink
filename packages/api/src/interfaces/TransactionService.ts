import { TransactionStatus, UserProfile } from '@lactalink/types';
import type {
  DeliveryDetail,
  DeliveryUpdate,
  Donation,
  MilkBag,
  Request,
  Transaction,
  User,
} from '@lactalink/types/payload-generated-types';

/**
 * Parameters for updating delivery details.
 */
export type DeliveryDetailsParams = Pick<
  DeliveryDetail,
  'address' | 'scheduledAt' | 'notes' | 'method'
>;

type BaseTransactionParams = {
  milkBags: (string | MilkBag)[];
  donation: string | Donation;
  request: string | Request;
};

type OrganizationTransactionParams = {
  organization: Exclude<UserProfile, { relationTo: 'individuals' }>;
  delivery: Omit<DeliveryDetailsParams, 'method'>;
};

/**
 * Parameters for creating a P2P transaction.
 */
export type CreateP2PTransactionParams = BaseTransactionParams;

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
   * @param transaction - The transaction document
   * @param details - Delivery details
   * @returns Updated transaction
   */
  proposeDeliveryOption(
    transaction: Transaction,
    details: DeliveryDetailsParams
  ): Promise<Transaction>;

  /**
   * Accepts proposed delivery proposal and schedules the delivery.
   * @param transaction - The transaction document
   * @param deliveryDetail - The delivery detail to accept
   * @returns Updated transaction
   */
  acceptDeliveryProposal(
    transaction: Transaction,
    deliveryDetail: string | DeliveryDetail
  ): Promise<Transaction>;

  /**
   * Rejects proposed delivery proposal.
   * @param transaction - The transaction document
   * @param deliveryDetail - The delivery detail to reject
   * @returns Updated transaction
   */
  rejectDeliveryProposal(
    transaction: Transaction,
    deliveryDetail: string | DeliveryDetail
  ): Promise<Transaction>;

  /**
   * Updates the transaction status to READY_FOR_PICKUP (donor confirms milk is ready).
   * Only applicable for PICKUP mode transactions.
   * @param transaction - The transaction document
   * @param markedBy - User marking the transaction as ready
   * @returns Updated transaction
   */
  readyForPickup(transaction: Transaction, markedBy: User): Promise<Transaction>;

  /**
   * Updates the transaction status to PREPARING (sender starts preparing milk for transfer).
   * @param transactionId ID of the transaction
   * @param markedBy User marking the transaction as preparing
   * @returns Updated transaction
   */
  startPreparing(transaction: Transaction, markedBy: User): Promise<Transaction>;

  /**
   * Updates the transaction status to IN_TRANSIT (donor starts delivery journey).
   * Only applicable for DELIVERY mode transactions.
   * @param transaction - The transaction document
   * @param markedBy - User marking the transaction as in transit
   * @returns Updated transaction
   */
  startTransit(transaction: Transaction, markedBy: User): Promise<Transaction>;

  /**
   * Marks the transaction as DELIVERED (milk physically transferred).
   * @param transaction - The transaction document
   * @param markedBy - User marking the transaction as delivered
   * @returns Updated transaction
   */
  markDelivered(transaction: Transaction, markedBy: User): Promise<Transaction>;

  /**
   * Marks the transaction as READ by the user.
   * @param transaction The transaction document
   * @param markedBy User marking the transaction as read
   */
  markAsRead(transaction: Transaction, markedBy: User): Promise<Transaction>;

  /**
   * Updates the delivery status of a transaction for a specific user.
   * @param transaction The transaction document
   * @param markedBy `User` marking the delivery status
   * @param status New delivery status
   * @returns `DeliveryUpdate` document
   */
  updateDeliveryStatus(
    transaction: Transaction,
    markedBy: User,
    status: DeliveryUpdate['status']
  ): Promise<DeliveryUpdate>;

  /**
   * Completes the transaction (recipient verifies receipt and quality).
   * Only the recipient can complete a transaction.
   * @param transaction - The transaction document
   * @param markedBy - User marking the transaction as complete
   * @returns Updated transaction
   */
  completeTransaction(transaction: Transaction, markedBy: User): Promise<Transaction>;

  /**
   * Marks a transaction as failed with a reason.
   * @param transaction - The transaction document
   * @param markedBy - User marking the transaction as failed
   * @param reason - Reason for failure
   * @returns Updated transaction
   */
  failTransaction(transaction: Transaction, markedBy: User, reason: string): Promise<Transaction>;

  /**
   * Cancels a transaction with a reason.
   * @param transaction - The transaction document
   * @param markedBy - User marking the transaction as cancelled
   * @param reason - Reason for cancellation
   * @returns Updated transaction
   */
  cancelTransaction(transaction: Transaction, markedBy: User, reason: string): Promise<Transaction>;

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
