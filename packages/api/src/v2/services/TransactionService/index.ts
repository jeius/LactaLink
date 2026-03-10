import {
  DELIVERY_DETAILS_STATUS,
  DELIVERY_OPTIONS,
  DELIVERY_UPDATES,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@lactalink/enums';
import { TransactionStatus } from '@lactalink/types';
import type {
  DeliveryDetail,
  DeliveryUpdate,
  Donation,
  MilkBag,
  Request,
  Transaction,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

import type {
  CreateO2PTransactionParams,
  CreateP2OTransactionParams,
  CreateP2PTransactionParams,
  DeliveryDetailsParams,
  ITransactionService,
} from '@/interfaces';
import { IApiClient } from '@/v2/ApiClient';
import {
  fetchDonation,
  fetchRequest,
  getDeliveryDetail,
  getUserDeliveryUpdate,
  getVolume,
} from './helpers';

// Transaction status constants
const TXN_PENDING = TRANSACTION_STATUS.PENDING.value;
const TXN_CONFIRMED = TRANSACTION_STATUS.CONFIRMED.value;
const TXN_IN_TRANSIT = TRANSACTION_STATUS.IN_TRANSIT.value;
const TXN_PICKUP_READY = TRANSACTION_STATUS.READY_FOR_PICKUP.value;
const TXN_DELIVERED = TRANSACTION_STATUS.DELIVERED.value;
const TXN_COMPLETED = TRANSACTION_STATUS.COMPLETED.value;
const TXN_FAILED = TRANSACTION_STATUS.FAILED.value;
const TXN_CANCELLED = TRANSACTION_STATUS.CANCELLED.value;

// Delivery detail status constants
const DELIVERY_ACCEPTED = DELIVERY_DETAILS_STATUS.ACCEPTED.value;
const DELIVERY_PROPOSED = DELIVERY_DETAILS_STATUS.PENDING.value;
const DELIVERY_REJECTED = DELIVERY_DETAILS_STATUS.REJECTED.value;

// Delivery update status constants
const DELIVERY_PREPARING = DELIVERY_UPDATES.PREPARING.value;
const DELIVERY_PICKUP_READY = DELIVERY_UPDATES.PICKUP_READY.value;
const DELIVERY_DELIVERED = DELIVERY_UPDATES.DELIVERED.value;
const DELIVERY_COMPLETED = DELIVERY_UPDATES.COMPLETED.value;
const DELIVERY_FAILED = DELIVERY_UPDATES.FAILED.value;
const DELIVERY_CANCELLED = DELIVERY_UPDATES.CANCELLED.value;

/**
 * Service for managing transactions throughout their lifecycle.
 * Handles creation, status updates, delivery scheduling, and completion.
 */
export class TransactionService implements ITransactionService {
  /**
   * Creates a new TransactionService instance.
   * @param apiClient - The API client used to communicate with the backend
   */
  constructor(private apiClient: IApiClient) {}

  // #region Transaction Creation Methods
  async createP2PTransaction(params: CreateP2PTransactionParams): Promise<Transaction> {
    const { milkBags } = params;

    const getDonation = async () => {
      const donation = extractCollection(params.donation);
      return donation || fetchDonation(this.apiClient, extractID(params.donation));
    };

    const getRequest = async () => {
      const request = extractCollection(params.request);
      return request || fetchRequest(this.apiClient, extractID(params.request));
    };

    const [volume, donation, request] = await Promise.all([
      getVolume(this.apiClient, milkBags),
      getDonation(),
      getRequest(),
    ]);

    // Create the transaction
    return this.apiClient.create({
      collection: 'transactions',
      data: {
        type: TRANSACTION_TYPE.P2P.value,
        status: TXN_PENDING,
        donation: extractID(donation),
        request: extractID(request),
        sender: { relationTo: 'individuals', value: extractID(donation.donor) },
        recipient: { relationTo: 'individuals', value: extractID(request.requester) },
        milkBags: extractID(milkBags),
        volume: volume,
        // @ts-expect-error Safe to ignore.
        initiatedBy: undefined, // Auto-generated field
      },
    });
  }

  async createP2OTransaction(params: CreateP2OTransactionParams): Promise<Transaction> {
    const { organization, milkBags, delivery } = params;

    const getDonation = async () => {
      const donation = extractCollection(params.donation);
      return donation || fetchDonation(this.apiClient, extractID(params.donation));
    };

    const [volume, donation] = await Promise.all([
      getVolume(this.apiClient, milkBags),
      getDonation(),
    ]);

    // P2O transactions always use DELIVERY mode and are automatically scheduled
    const transaction = await this.apiClient.create({
      collection: 'transactions',
      data: {
        type: TRANSACTION_TYPE.P2O.value,
        status: TXN_CONFIRMED,
        donation: donation.id,
        sender: { relationTo: 'individuals', value: extractID(donation.donor) },
        recipient: organization,
        milkBags: extractID(milkBags),
        volume: volume,
        // @ts-expect-error Safe to ignore.
        initiatedBy: undefined, // Auto-generated field
      },
    });

    const deliveryDetail = await this.apiClient
      .create({
        collection: 'delivery-details',
        data: {
          ...delivery,
          transaction: transaction.id,
          status: DELIVERY_ACCEPTED,
          method: DELIVERY_OPTIONS.DELIVERY.value,
          // @ts-expect-error Safe to ignore.
          proposedBy: undefined, // Auto-generated field
        },
      })
      .catch(async (err) => {
        await this.apiClient.deleteByID({ collection: 'transactions', id: transaction.id });
        throw err;
      });

    return {
      ...transaction,
      deliveryDetails: { docs: [deliveryDetail], totalDocs: 1, hasNextPage: false },
    };
  }

  async createO2PTransaction(params: CreateO2PTransactionParams) {
    const { organization, milkBags, delivery } = params;

    const getRequest = async () => {
      const request = extractCollection(params.request);
      return request || fetchRequest(this.apiClient, extractID(params.request));
    };

    const [volume, request] = await Promise.all([
      getVolume(this.apiClient, milkBags),
      getRequest(),
    ]);

    // O2P transactions always use PICKUP mode and are automatically scheduled
    const transaction = await this.apiClient.create({
      collection: 'transactions',
      data: {
        type: TRANSACTION_TYPE.O2P.value,
        status: TXN_CONFIRMED,
        request: extractID(request),
        sender: organization,
        recipient: { relationTo: 'individuals', value: extractID(request.requester) },
        milkBags: extractID(milkBags),
        volume: volume,
        // @ts-expect-error Safe to ignore.
        initiatedBy: undefined, // Auto-generated field
      },
    });

    const deliveryDetail = await this.apiClient
      .create({
        collection: 'delivery-details',
        data: {
          ...delivery,
          transaction: transaction.id,
          status: DELIVERY_ACCEPTED,
          method: DELIVERY_OPTIONS.PICKUP.value,
          // @ts-expect-error Safe to ignore.
          proposedBy: undefined, // Auto-generated field
        },
      })
      .catch(async (err) => {
        await this.apiClient.deleteByID({ collection: 'transactions', id: transaction.id });
        throw err;
      });

    return {
      ...transaction,
      deliveryDetails: { docs: [deliveryDetail], totalDocs: 1, hasNextPage: false },
    };
  }
  // #endregion

  // #region Delivery Agreement Methods
  async proposeDeliveryOption(
    transaction: Transaction,
    details: DeliveryDetailsParams
  ): Promise<Transaction> {
    // Can only propose delivery details for transactions in PENDING status
    if (transaction.status !== TXN_PENDING) {
      throw new Error(
        `Cannot propose delivery details for transaction in ${transaction.status} status`
      );
    }

    // Create new delivery detail
    await this.apiClient.create({
      collection: 'delivery-details',
      data: {
        ...details,
        transaction: transaction.id,
        status: DELIVERY_PROPOSED,
        // @ts-expect-error Safe to ignore.
        proposedBy: undefined, // Auto-generated field
      },
    });

    // Return fresh transaction
    return this.getTransaction(transaction.id, 3);
  }

  async acceptDeliveryProposal(transaction: Transaction, deliveryDetail: string | DeliveryDetail) {
    // Can only accept delivery details for transactions in PENDING status
    if (transaction.status !== TXN_PENDING) {
      throw new Error(
        `Cannot accept delivery details for transaction in ${transaction.status} status`
      );
    }

    // Update the delivery detail status to ACCEPTED
    await this.apiClient.updateByID({
      collection: 'delivery-details',
      id: extractID(deliveryDetail),
      data: { status: DELIVERY_ACCEPTED },
      depth: 0,
    });

    // Return fresh transaction
    return this.getTransaction(transaction.id, 3);
  }

  async rejectDeliveryProposal(transaction: Transaction, deliveryDetail: string | DeliveryDetail) {
    // Can only reject delivery details for transactions in PENDING status
    if (transaction.status !== TXN_PENDING) {
      throw new Error(
        `Cannot accept delivery details for transaction in ${transaction.status} status`
      );
    }

    // Update the delivery detail status to ACCEPTED
    await this.apiClient.updateByID({
      collection: 'delivery-details',
      id: extractID(deliveryDetail),
      data: { status: DELIVERY_REJECTED },
      depth: 0,
    });

    // Return fresh transaction
    return this.getTransaction(transaction.id, 3);
  }
  // #endregion

  // #region Delivery Execution Methods
  async startPreparing(transaction: Transaction, markedBy: User) {
    // Can only start transit if in DELIVERY_SCHEDULED status and mode is DELIVERY
    if (transaction.status !== TXN_CONFIRMED) {
      throw new Error(`Cannot start transit: transaction is in ${transaction.status} status`);
    }

    await this.updateDeliveryStatus(transaction, markedBy, DELIVERY_PREPARING);

    // Update transaction status
    return this.getTransaction(transaction.id, 3);
  }

  async startTransit(transaction: Transaction, markedBy: User) {
    // Can only start transit if in CONFIRMED status
    if (transaction.status !== TXN_CONFIRMED) {
      throw new Error(`Cannot start transit: transaction is in ${transaction.status} status`);
    }

    const deliveryDetail = getDeliveryDetail(transaction);
    const method = deliveryDetail.method;

    // Only DELIVERY and MEETUP mode transactions can start transit
    if (method === DELIVERY_OPTIONS.PICKUP.value) {
      throw new Error(`Cannot start transit: delivery method is ${method}`);
    }

    const updated = this.optimisticStatusUpdate(transaction, TXN_IN_TRANSIT, markedBy.profile);

    // Update transaction status
    return this.apiClient.updateByID({
      collection: 'transactions',
      id: transaction.id,
      data: { status: TXN_IN_TRANSIT, tracking: updated.tracking },
    });
  }

  async readyForPickup(transaction: Transaction, markedBy: User): Promise<Transaction> {
    // Can only start transit if in CONFIRMED status
    if (transaction.status !== TXN_CONFIRMED) {
      throw new Error(`Cannot start transit: transaction is in ${transaction.status} status`);
    }

    const deliveryDetail = getDeliveryDetail(transaction);
    const method = deliveryDetail.method;

    if (method !== DELIVERY_OPTIONS.PICKUP.value) {
      throw new Error(`Cannot mark as ready for pickup: delivery method is ${method}`);
    }

    await this.updateDeliveryStatus(transaction, markedBy, DELIVERY_PICKUP_READY);

    const updated = this.optimisticStatusUpdate(transaction, TXN_PICKUP_READY, markedBy.profile);

    // Update transaction status
    return this.apiClient.updateByID({
      collection: 'transactions',
      id: transaction.id,
      data: {
        status: TXN_PICKUP_READY,
        tracking: { statusHistory: updated.tracking?.statusHistory },
      },
    });
  }

  async markDelivered(transaction: Transaction, markedBy: User) {
    // Can only mark as delivered from certain statuses
    const validStatuses: TransactionStatus[] = [
      TRANSACTION_STATUS.READY_FOR_PICKUP.value,
      TRANSACTION_STATUS.IN_TRANSIT.value,
    ];

    if (!validStatuses.includes(transaction.status)) {
      throw new Error(`Cannot mark as delivered: transaction is in ${transaction.status} status`);
    }

    await this.updateDeliveryStatus(transaction, markedBy, DELIVERY_DELIVERED);
    const updated = this.optimisticStatusUpdate(transaction, TXN_DELIVERED, markedBy.profile);

    // Update transaction status
    return this.apiClient.updateByID({
      collection: 'transactions',
      id: transaction.id,
      data: {
        status: TXN_DELIVERED,
        tracking: {
          statusHistory: updated.tracking?.statusHistory,
          deliveredAt: new Date().toISOString(),
        },
      },
    });
  }

  async markAsRead(transaction: Transaction): Promise<Transaction> {
    await this.apiClient.create({
      collection: 'transaction-reads',
      data: {
        transaction: transaction.id,
        // @ts-expect-error Safe to ignore.
        user: undefined, // Auto-generated field
      },
    });

    return this.getTransaction(transaction.id, 3);
  }

  async updateDeliveryStatus(
    transaction: Transaction,
    markedBy: User,
    status: DeliveryUpdate['status']
  ) {
    const deliveryUpdate = getUserDeliveryUpdate(transaction, markedBy);

    if (deliveryUpdate) {
      return this.apiClient.updateByID({
        collection: 'delivery-updates',
        id: deliveryUpdate.id,
        data: { status },
      });
    } else {
      return this.apiClient.create({
        collection: 'delivery-updates',
        data: {
          transaction: transaction.id,
          user: extractID(markedBy),
          status,
        },
      });
    }
  }
  // #endregion

  // #region Completion Methods
  async completeTransaction(transaction: Transaction, markedBy: User) {
    // Can only complete if in DELIVERED status
    if (transaction.status !== TXN_DELIVERED) {
      throw new Error(
        `Cannot complete transaction: transaction is in ${transaction.status} status`
      );
    }

    // Mark the transaction as completed
    const completedTransaction = await this.apiClient.updateByID({
      collection: 'transactions',
      id: transaction.id,
      data: {
        status: TXN_COMPLETED,
        tracking: { completedAt: new Date().toISOString() },
      },
    });

    // Update related entities
    await this.finalizeTransaction(transaction, markedBy);

    return completedTransaction;
  }
  // #endregion

  // #region Failure/Cancellation Methods
  async failTransaction(transaction: Transaction, markedBy: User, reason: string) {
    // Cannot fail if already completed
    if (transaction.status === TXN_COMPLETED) {
      throw new Error('Cannot fail a completed transaction');
    }

    await this.updateDeliveryStatus(transaction, markedBy, DELIVERY_FAILED);

    // Mark the transaction as failed
    return this.apiClient.updateByID({
      collection: 'transactions',
      id: transaction.id,
      data: {
        status: TXN_FAILED,
        tracking: {
          failedAt: new Date().toISOString(),
          failureReason: reason,
        },
      },
    });
  }

  async cancelTransaction(transaction: Transaction, markedBy: User, reason: string) {
    // Cannot cancel if already completed
    if (transaction.status === TRANSACTION_STATUS.COMPLETED.value) {
      throw new Error('Cannot cancel a completed transaction');
    }

    await this.updateDeliveryStatus(transaction, markedBy, DELIVERY_CANCELLED);

    // Mark the transaction as cancelled
    return this.apiClient.updateByID({
      collection: 'transactions',
      id: transaction.id,
      data: {
        status: TXN_CANCELLED,
        tracking: {
          cancelledAt: new Date().toISOString(),
          cancelReason: reason,
        },
      },
    });
  }
  // #endregion

  // #region Optimistic Update Methods
  optimisticStatusUpdate(
    transaction: Transaction,
    newStatus: TransactionStatus,
    markedBy: User['profile'],
    reason?: string
  ): Transaction {
    if (!markedBy) {
      throw new Error('User profile not found. Please setup your account');
    }

    const failedStat = TRANSACTION_STATUS.FAILED.value;
    const cancelledStat = TRANSACTION_STATUS.CANCELLED.value;
    const completedStat = TRANSACTION_STATUS.COMPLETED.value;
    const deliveredStat = TRANSACTION_STATUS.DELIVERED.value;

    return {
      ...transaction,
      status: newStatus,
      tracking: {
        ...transaction.tracking,
        failedAt:
          newStatus === failedStat ? new Date().toISOString() : transaction.tracking?.failedAt,
        failureReason: newStatus === failedStat ? reason : transaction.tracking?.failureReason,
        cancelledAt:
          newStatus === cancelledStat
            ? new Date().toISOString()
            : transaction.tracking?.cancelledAt,
        cancelReason: newStatus === cancelledStat ? reason : transaction.tracking?.cancelReason,
        completedAt:
          newStatus === completedStat
            ? new Date().toISOString()
            : transaction.tracking?.completedAt,
        deliveredAt:
          newStatus === deliveredStat
            ? new Date().toISOString()
            : transaction.tracking?.deliveredAt,
      },
    };
  }
  // #endregion Optimistic Update Methods

  // #region Helper Methods
  /**
   * Gets a transaction by ID.
   * @param transactionId - ID of the transaction
   * @param depth - Depth of relations to retrieve (default: 0)
   * @returns The transaction
   */
  private async getTransaction(transactionId: string, depth: number = 0): Promise<Transaction> {
    return this.apiClient.findByID({
      collection: 'transactions',
      id: transactionId,
      depth,
      joins: {
        deliveryDetails: { count: true },
        deliveryUpdates: { count: true },
        deliveryPlans: { count: true, limit: 1, sort: '-updatedAt' },
        'tracking.reads': { count: true, limit: 2 },
        'tracking.statusHistory': false,
      },
    });
  }

  /**
   * Updates the status of milk bags.
   * @param ids - IDs of milk bags to update
   * @param status - New status
   */
  private async updateMilkBagStatus(ids: string[], status: MilkBag['status']) {
    return await this.apiClient.update({
      collection: 'milkBags',
      data: { status },
      where: { id: { in: ids } },
    });
  }

  /**
   * Updates the status of a donation.
   * @param id - ID of the donation
   * @param status - New status
   */
  private async updateDonationStatus(id: string, status: Donation['status']) {
    return await this.apiClient.updateByID({
      collection: 'donations',
      id: id,
      data: { status },
    });
  }

  /**
   * Updates the status of a request.
   * @param id - ID of the request
   * @param status - New status
   */
  private async updateRequestStatus(id: string, status: Request['status']) {
    return await this.apiClient.updateByID({
      collection: 'requests',
      id: id,
      data: { status },
    });
  }

  /**
   * Handles all required updates when a transaction is finalized.
   * @param transaction - The completed transaction
   */
  private async finalizeTransaction(transaction: Transaction, markedBy: User): Promise<void> {
    const P2P = TRANSACTION_TYPE.P2P.value;
    const P2O = TRANSACTION_TYPE.P2O.value;
    const O2P = TRANSACTION_TYPE.O2P.value;

    const promises: Promise<unknown>[] = [
      this.updateDeliveryStatus(transaction, markedBy, DELIVERY_COMPLETED),
    ];

    // For P2P transactions, update donation and request statuses
    if (transaction.type === P2P) {
      if (!transaction.donation || !transaction.request) {
        throw new Error('P2P transaction must have both donation and request');
      }

      promises.push(
        this.updateDonationStatus(extractID(transaction.donation), 'COMPLETED'),
        this.updateRequestStatus(extractID(transaction.request), 'COMPLETED')
      );

      if (transaction.milkBags) {
        promises.push(this.updateMilkBagStatus(extractID(transaction.milkBags), 'CONSUMED'));
      }
    }

    // For P2O transactions, update donation status and create inventory entry
    else if (transaction.type === P2O) {
      if (!transaction.donation) throw new Error('P2O transaction must have a donation');
      promises.push(this.updateDonationStatus(extractID(transaction.donation), 'COMPLETED'));
    }

    // For O2P transactions, update request status
    else if (transaction.type === O2P) {
      if (!transaction.request) throw new Error('O2P transaction must have a request');

      promises.push(this.updateRequestStatus(extractID(transaction.request), 'COMPLETED'));

      if (transaction.milkBags) {
        promises.push(this.updateMilkBagStatus(extractID(transaction.milkBags), 'CONSUMED'));
      }
    }

    await Promise.all(promises);
  }
  // #endregion
}
