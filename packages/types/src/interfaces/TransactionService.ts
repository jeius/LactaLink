import type { FindMany, FindManyResult } from '../api';
import type { SelectFromCollectionSlug } from '../payload-types/config';
import type {
  Address,
  Donation,
  MilkBag,
  ProposedDelivery,
  Request,
  Transaction,
  User,
} from '../payload-types/generated';

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

/**
 * Parameters for creating a P2P transaction.
 */
export interface CreateP2PTransactionParams {
  donation: string | Donation;
  request: string | Request;
  milkBags: (string | MilkBag)[];
}

/**
 * Parameters for creating a P2O transaction.
 */
export interface CreateP2OTransactionParams {
  donation: string | Donation;
  milkBags: (string | MilkBag)[];
  organization: Exclude<NonNullable<User['profile']>, { relationTo: 'individuals' }>;
  address: string | Address;
}

/**
 * Parameters for creating an O2P transaction.
 */
export interface CreateO2PTransactionParams {
  request: string | Request;
  milkBags: (string | MilkBag)[];
  address: string | Address;
  organization: Exclude<NonNullable<User['profile']>, { relationTo: 'individuals' }>;
}

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
   * Accepts proposed delivery option and schedules the delivery.
   * @param transactionID - ID of the transaction
   * @param proposalID - ID of the accepted proposal
   * @param acceptedBy - User profile accepting the proposal
   * @returns Updated transaction
   */
  acceptDeliveryOption(
    transactionID: string,
    proposalID: string,
    acceptedBy: NonNullable<User['profile']>
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
   * Updates the transaction status to IN_TRANSIT (donor starts delivery journey).
   * Only applicable for DELIVERY mode transactions.
   * @param transactionId - ID of the transaction
   * @param markedBy - User marking the transaction as in transit
   * @returns Updated transaction
   */
  startTransit(transactionId: string, markedBy: NonNullable<User['profile']>): Promise<Transaction>;

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
   * Gets a transaction by ID.
   * @param transactionId - ID of the transaction
   * @param depth - Depth of relations to retrieve (default: 3)
   * @returns The transaction
   */
  getTransaction(transactionId: string, depth?: number): Promise<Transaction>;

  /**
   * Gets all paginated transactions for a user (as donor or requester).
   * @param profileID - ID of the user profile (Individual, Hospital, or Milk Bank)
   * @param options - Optional query parameters
   * @returns List of paginated transactions
   */
  getUserTransactions<
    TSelect extends
      SelectFromCollectionSlug<'transactions'> = SelectFromCollectionSlug<'transactions'>,
    TPaginate extends boolean = boolean,
  >(
    profileID: string,
    options?: FindMany<'transactions', TSelect, TPaginate>
  ): Promise<FindManyResult<'transactions', TSelect, TPaginate>>;
}
