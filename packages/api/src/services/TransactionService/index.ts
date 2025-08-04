import { DELIVERY_OPTIONS, TRANSACTION_STATUS, TRANSACTION_TYPE } from '@lactalink/enums';
import {
  DeliveryAgreements,
  Donation,
  FindMany,
  FindManyResult,
  IApiClient,
  MilkBag,
  Request,
  SelectFromCollectionSlug,
  Transaction,
  User,
} from '@lactalink/types';
import {
  CreateO2PTransactionParams,
  CreateP2OTransactionParams,
  CreateP2PTransactionParams,
  DeliveryDetailsParams,
  ITransactionService,
} from '@lactalink/types/interfaces';
import { extractCollection, extractID } from '@lactalink/utilities';

/**
 * Service for managing transactions throughout their lifecycle.
 * Handles creation, status updates, delivery scheduling, and completion.
 */
export class TransactionService implements ITransactionService {
  private apiClient: IApiClient;

  // #region Constructor
  /**
   * Creates a new TransactionService instance.
   * @param apiClient - The API client used to communicate with the backend
   */
  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
  }
  // #endregion

  // #region Transaction Creation Methods
  async createP2PTransaction(params: CreateP2PTransactionParams) {
    const { milkBags, delivery, proposedDelivery } = params;

    const getDonation = async () => {
      const donation = extractCollection(params.donation);
      return donation || this.getDonation(extractID(params.donation));
    };

    const getRequest = async () => {
      const request = extractCollection(params.request);
      return request || this.getRequest(extractID(params.request));
    };

    const [volume, donation, request] = await Promise.all([
      this.getVolume(milkBags),
      getDonation(),
      getRequest(),
    ]);

    const status = delivery
      ? TRANSACTION_STATUS.DELIVERY_SCHEDULED.value
      : proposedDelivery
        ? TRANSACTION_STATUS.PENDING_DELIVERY_CONFIRMATION.value
        : TRANSACTION_STATUS.MATCHED.value;

    // Create the transaction
    const transaction = await this.apiClient.create({
      collection: 'transactions',
      data: {
        transactionType: TRANSACTION_TYPE.P2P.value,
        status: status,
        donation: extractID(donation),
        sender: { relationTo: 'individuals', value: extractID(donation.donor) },
        request: extractID(request),
        recipient: { relationTo: 'individuals', value: extractID(request.requester) },
        matchedBags: extractID(milkBags),
        matchedVolume: volume,
        delivery: {
          instructions: params.instructions,
          confirmedDelivery: delivery,
          proposedDelivery: proposedDelivery ? [proposedDelivery] : undefined,
        },
      },
    });

    const [updatedBags, updatedDonation, updatedRequest] = await Promise.all([
      // Update milk bags to ALLOCATED status
      this.updateMilkBagStatus(extractID(milkBags), 'ALLOCATED'),
      // Update donation and request statuses to MATCHED
      this.updateDonationStatus(extractID(donation), 'MATCHED'),
      this.updateRequestStatus(extractID(request), 'MATCHED'),
    ]);

    return {
      transaction,
      donation: updatedDonation,
      request: updatedRequest,
      milkBags: updatedBags,
    };
  }

  async createP2OTransaction(params: CreateP2OTransactionParams) {
    const { organization, milkBags, address } = params;

    const getDonation = async () => {
      const donation = extractCollection(params.donation);
      return donation || this.getDonation(extractID(params.donation));
    };

    const [volume, donation] = await Promise.all([this.getVolume(milkBags), getDonation()]);

    // P2O transactions always use DELIVERY mode and are automatically scheduled
    const transaction = await this.apiClient.create({
      collection: 'transactions',
      data: {
        transactionType: TRANSACTION_TYPE.P2O.value,
        status: TRANSACTION_STATUS.DELIVERY_SCHEDULED.value,
        donation: donation.id,
        sender: { relationTo: 'individuals', value: extractID(donation.donor) },
        recipient: organization,
        matchedBags: extractID(milkBags),
        matchedVolume: volume,
        delivery: {
          confirmedDelivery: {
            confirmedAt: new Date().toISOString(),
            mode: DELIVERY_OPTIONS.DELIVERY.value,
            address: extractID(address),
          },
        },
      },
    });

    const [updatedBags, updatedDonation] = await Promise.all([
      // Update milk bags to ALLOCATED status
      this.updateMilkBagStatus(extractID(milkBags), 'ALLOCATED'),
      // Update donation status to MATCHED
      this.updateDonationStatus(extractID(donation), 'MATCHED'),
    ]);

    return { transaction, milkBags: updatedBags, donation: updatedDonation };
  }

  async createO2PTransaction(params: CreateO2PTransactionParams) {
    const { organization, milkBags, address } = params;

    const getRequest = async () => {
      const request = extractCollection(params.request);
      return request || this.getRequest(extractID(params.request));
    };

    const [volume, request] = await Promise.all([this.getVolume(milkBags), getRequest()]);

    // O2P transactions always use PICKUP mode and are automatically scheduled
    const transaction = await this.apiClient.create<'transactions'>({
      collection: 'transactions',
      data: {
        transactionType: TRANSACTION_TYPE.O2P.value,
        status: TRANSACTION_STATUS.DELIVERY_SCHEDULED.value,
        request: extractID(request),
        sender: organization,
        recipient: { relationTo: 'individuals', value: extractID(request.requester) },
        matchedBags: extractID(milkBags),
        matchedVolume: volume,
        delivery: {
          confirmedDelivery: {
            mode: DELIVERY_OPTIONS.PICKUP.value,
            confirmedAt: new Date().toISOString(),
            address: extractID(address),
          },
        },
      },
    });

    const [updatedBag, updatedRequest] = await Promise.all([
      // Update milk bags to ALLOCATED status
      this.updateMilkBagStatus(extractID(milkBags), 'ALLOCATED'),
      // Update request status to MATCHED
      this.updateRequestStatus(extractID(request), 'MATCHED'),
    ]);

    return { transaction, milkBags: updatedBag, request: updatedRequest };
  }
  // #endregion

  // #region Delivery Agreement Methods
  async proposeDeliveryOption(
    transactionId: string,
    details: DeliveryDetailsParams
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID({
      collection: 'transactions',
      id: transactionId,
      depth: 0,
      select: { status: true, delivery: true, sender: true, recipient: true },
    });

    const matchedStatus = TRANSACTION_STATUS.MATCHED.value;
    const pendingDeliveryStatus = TRANSACTION_STATUS.PENDING_DELIVERY_CONFIRMATION.value;

    // Can only propose delivery details for transactions in MATCHED and PENDING status
    if (transaction.status !== matchedStatus && transaction.status !== pendingDeliveryStatus) {
      throw new Error(
        `Cannot propose delivery details for transaction in ${transaction.status} status`
      );
    }

    const existingProposals = transaction.delivery?.proposedDelivery || [];
    const proposal = details;

    const proposedByID = extractID(proposal.proposedBy.value);
    const agreements: DeliveryAgreements = {};

    if (proposedByID === extractID(transaction.sender.value)) {
      agreements.sender = {
        agreed: true,
        agreedBy: proposal.proposedBy,
        agreedAt: new Date().toISOString(),
      };
    } else if (proposedByID === extractID(transaction.recipient.value)) {
      agreements.recipient = {
        agreed: true,
        agreedBy: proposal.proposedBy,
        agreedAt: new Date().toISOString(),
      };
    }

    // Update the transaction with proposed details
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: pendingDeliveryStatus,
        delivery: {
          proposedDelivery: [
            ...existingProposals,
            {
              ...proposal,
              proposedAt: new Date().toISOString(),
              agreements,
            },
          ],
        },
      },
    });
  }

  async acceptDeliveryOption(
    transactionID: string,
    proposalID: string,
    acceptedBy: NonNullable<User['profile']>
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID({
      collection: 'transactions',
      id: transactionID,
      depth: 0,
      select: { status: true, delivery: true, sender: true, recipient: true },
    });

    // Can only accept delivery details for transactions in PENDING_DELIVERY_CONFIRMATION status
    if (transaction.status !== TRANSACTION_STATUS.PENDING_DELIVERY_CONFIRMATION.value) {
      throw new Error(
        `Cannot accept delivery details for transaction in ${transaction.status} status`
      );
    }

    const acceptedByID = extractID(acceptedBy.value);
    const senderID = extractID(transaction.sender.value);
    const recipientID = extractID(transaction.recipient.value);
    const isSender = acceptedByID === senderID;
    const isRecipient = acceptedByID === recipientID;

    const existingProposals = transaction.delivery?.proposedDelivery || [];

    const newProposals = existingProposals.map((proposal) => {
      if (proposal.id === proposalID) {
        const updatedAgreements = proposal.agreements || {};
        const senderAgreed = updatedAgreements.sender?.agreed;
        const recipientAgreed = updatedAgreements.recipient?.agreed;

        if (isSender && !senderAgreed) {
          updatedAgreements.sender = {
            agreed: true,
            agreedBy: acceptedBy,
            agreedAt: new Date().toISOString(),
          };
        } else if (isRecipient && !recipientAgreed) {
          updatedAgreements.recipient = {
            agreed: true,
            agreedBy: acceptedBy,
            agreedAt: new Date().toISOString(),
          };
        }
        return {
          ...proposal,
          agreements: updatedAgreements,
        };
      }

      return proposal;
    });

    // Update the transaction with confirmed details
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionID,
      data: {
        delivery: {
          ...transaction.delivery,
          proposedDelivery: newProposals,
        },
      },
    });
  }
  // #endregion

  // #region Delivery Execution Methods
  async readyForPickup(
    transactionId: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      depth: 0,
      select: { status: true, delivery: true, tracking: true, sender: true, recipient: true },
    });

    // Can only set as ready for pickup if in DELIVERY_SCHEDULED status and mode is PICKUP
    if (transaction.status !== TRANSACTION_STATUS.DELIVERY_SCHEDULED.value) {
      throw new Error(
        `Cannot mark as ready for pickup: transaction is in ${transaction.status} status`
      );
    }

    const deliveryMode = transaction.delivery?.confirmedDelivery?.mode;

    if (deliveryMode !== DELIVERY_OPTIONS.PICKUP.value) {
      throw new Error(`Cannot mark as ready for pickup: transaction mode is ${deliveryMode}`);
    }

    const pickupStatus = TRANSACTION_STATUS.READY_FOR_PICKUP.value;

    const updatedStatusHistory = this.updateStatusHistory(transaction, pickupStatus, markedBy);

    // Update transaction status
    return this.apiClient.updateByID({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: pickupStatus,
        tracking: { statusHistory: updatedStatusHistory },
      },
    });
  }

  async startTransit(
    transactionId: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID({
      collection: 'transactions',
      id: transactionId,
      depth: 0,
      select: { status: true, delivery: true, tracking: true, sender: true, recipient: true },
    });

    // Can only start transit if in DELIVERY_SCHEDULED status and mode is DELIVERY
    if (transaction.status !== TRANSACTION_STATUS.DELIVERY_SCHEDULED.value) {
      throw new Error(`Cannot start transit: transaction is in ${transaction.status} status`);
    }

    const deliveryMode = transaction.delivery?.confirmedDelivery?.mode;
    if (deliveryMode !== DELIVERY_OPTIONS.DELIVERY.value) {
      throw new Error(`Cannot start transit: transaction mode is ${deliveryMode}`);
    }

    const transitStatus = TRANSACTION_STATUS.IN_TRANSIT.value;

    const updatedStatusHistory = this.updateStatusHistory(transaction, transitStatus, markedBy);

    // Update transaction status
    return this.apiClient.updateByID({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: transitStatus,
        tracking: { statusHistory: updatedStatusHistory },
      },
    });
  }

  async markDelivered(
    transactionId: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      depth: 0,
      select: { status: true, delivery: true, tracking: true, sender: true, recipient: true },
    });

    // Can only mark as delivered from certain statuses
    const validStatuses: (keyof typeof TRANSACTION_STATUS)[] = [
      TRANSACTION_STATUS.DELIVERY_SCHEDULED.value,
      TRANSACTION_STATUS.READY_FOR_PICKUP.value,
      TRANSACTION_STATUS.IN_TRANSIT.value,
    ];

    if (!validStatuses.includes(transaction.status)) {
      throw new Error(`Cannot mark as delivered: transaction is in ${transaction.status} status`);
    }

    const deliveredStatus = TRANSACTION_STATUS.DELIVERED.value;
    const updateStatusHistory = this.updateStatusHistory(transaction, deliveredStatus, markedBy);

    // Update transaction status
    return this.apiClient.updateByID({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: deliveredStatus,
        tracking: {
          statusHistory: updateStatusHistory,
          deliveredAt: new Date().toISOString(),
        },
      },
    });
  }
  // #endregion

  // #region Transaction Completion Methods
  async completeTransaction(
    transactionId: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID({
      collection: 'transactions',
      id: transactionId,
      depth: 0,
      select: { status: true, delivery: true, tracking: true, sender: true, recipient: true },
    });

    // Can only complete if in DELIVERED status
    if (transaction.status !== TRANSACTION_STATUS.DELIVERED.value) {
      throw new Error(
        `Cannot complete transaction: transaction is in ${transaction.status} status`
      );
    }

    const completedStatus = TRANSACTION_STATUS.COMPLETED.value;
    const updatesStatusHistory = this.updateStatusHistory(transaction, completedStatus, markedBy);

    // Mark the transaction as completed
    const completedTransaction = await this.apiClient.updateByID({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: completedStatus,
        tracking: {
          statusHistory: updatesStatusHistory,
          completedAt: new Date().toISOString(),
        },
      },
    });

    // Update related entities
    await this.finalizeTransaction(transaction);

    return completedTransaction;
  }
  // #endregion

  // #region Transaction Failure/Cancellation Methods
  async failTransaction(
    transactionId: string,
    reason: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      depth: 0,
      select: { status: true, delivery: true, tracking: true, sender: true, recipient: true },
    });

    // Cannot fail if already completed
    if (transaction.status === TRANSACTION_STATUS.COMPLETED.value) {
      throw new Error('Cannot fail a completed transaction');
    }

    const failStatus = TRANSACTION_STATUS.FAILED.value;
    const updatedStatusHistory = this.updateStatusHistory(transaction, failStatus, markedBy);

    // Mark the transaction as failed
    return this.apiClient.updateByID({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: failStatus,
        tracking: {
          statusHistory: updatedStatusHistory,
          failedAt: new Date().toISOString(),
          failureReason: reason,
        },
      },
    });
  }

  async cancelTransaction(
    transactionId: string,
    reason: string,
    markedBy: NonNullable<User['profile']>
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      depth: 0,
      select: { status: true, delivery: true, tracking: true, sender: true, recipient: true },
    });

    // Cannot cancel if already completed
    if (transaction.status === TRANSACTION_STATUS.COMPLETED.value) {
      throw new Error('Cannot cancel a completed transaction');
    }

    const cancelStatus = TRANSACTION_STATUS.CANCELLED.value;
    const updatedStatusHistory = this.updateStatusHistory(transaction, cancelStatus, markedBy);

    // Mark the transaction as cancelled
    return this.apiClient.updateByID({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: cancelStatus,
        tracking: {
          statusHistory: updatedStatusHistory,
          cancelledAt: new Date().toISOString(),
          cancelReason: reason,
        },
      },
    });
  }
  // #endregion

  // #region Transaction Query Methods
  async getTransaction(transactionId: string, depth: number = 3): Promise<Transaction> {
    return this.apiClient.findByID({
      collection: 'transactions',
      id: transactionId,
      depth,
    });
  }

  async getUserTransactions<
    TSelect extends
      SelectFromCollectionSlug<'transactions'> = SelectFromCollectionSlug<'transactions'>,
    TPaginate extends boolean = boolean,
  >(
    profileID: string,
    options?: FindMany<'transactions', TSelect, TPaginate>
  ): Promise<FindManyResult<'transactions', TSelect, TPaginate>> {
    const result = await this.apiClient.find({
      ...options,
      collection: 'transactions',
      sort: options?.sort || '-createdAt',
      where: {
        and: [
          {
            or: [
              { 'sender.value': { equals: profileID } },
              { 'recipient.value': { equals: profileID } },
            ],
          },
          options?.where || {},
        ],
      },
    });

    return result;
  }
  // #endregion

  // #region Helper Methods
  /**
   * Calculates the total volume of milk bags by their IDs.
   * @param bags - milk bags
   * @returns Total volume
   */
  private async getVolume(bags: (string | MilkBag)[]): Promise<number> {
    const milkBags =
      extractCollection(bags) ||
      (await this.apiClient.find({
        collection: 'milkBags',
        where: { id: { in: extractID(bags) } },
        pagination: false,
        select: { volume: true },
      }));

    return milkBags.reduce((total, bag) => total + (bag.volume || 0), 0);
  }

  /**
   * Retrieves a donation record by its unique identifier.
   *
   * @param donationId - The unique identifier of the donation to retrieve.
   * @returns A promise that resolves to the donation object.
   */
  private async getDonation(donationId: string): Promise<Donation> {
    return this.apiClient.findByID({
      collection: 'donations',
      id: donationId,
      depth: 0,
    });
  }

  /**
   * Retrieves a request by its unique identifier.
   *
   * @param requestId - The unique identifier of the request to retrieve.
   * @returns A promise that resolves to the requested `Request` object.
   */
  private async getRequest(requestId: string): Promise<Request> {
    return this.apiClient.findByID({
      collection: 'requests',
      id: requestId,
      depth: 0,
    });
  }

  /**
   * Updates the status of milk bags.
   * @param bagIds - IDs of milk bags to update
   * @param status - New status
   */
  private async updateMilkBagStatus(bagIds: string[], status: MilkBag['status']) {
    return await this.apiClient.update({
      collection: 'milkBags',
      data: { status },
      where: { id: { in: bagIds } },
    });
  }

  /**
   * Updates the status history of a transaction by appending a new status entry.
   *
   * @param transaction - The transaction object whose status history is being updated.
   * @param status - The new status to be added, represented as a key of the `TRANSACTION_STATUS` enum.
   * @param markedBy - The user profile marking the status change, which must be non-nullable.
   * @returns The updated status history array, containing all previous entries and the new status entry.
   */
  private updateStatusHistory(
    transaction: Partial<Transaction>,
    status: keyof typeof TRANSACTION_STATUS,
    markedBy: NonNullable<User['profile']>
  ): NonNullable<Transaction['tracking']>['statusHistory'] {
    const existingStatusHistory = transaction.tracking?.statusHistory || [];
    let senderOrRecipient: string | undefined;

    if (!transaction.sender || !transaction.recipient) {
      throw new Error('Transaction must have both sender and recipient to update status history');
    }

    const senderID = extractID(transaction.sender.value);
    const recipientID = extractID(transaction.recipient.value);
    const markedByID = extractID(markedBy.value);

    if (senderID === markedByID) {
      senderOrRecipient = 'Sender';
    } else if (recipientID === markedByID) {
      senderOrRecipient = 'Recipient';
    }

    const statusLabel = TRANSACTION_STATUS[status].label.toLowerCase();

    return [
      ...existingStatusHistory,
      {
        status: status,
        timestamp: new Date().toISOString(),
        notes: senderOrRecipient
          ? `${senderOrRecipient} marked as ${statusLabel}`
          : `Marked as ${statusLabel}`,
      },
    ];
  }

  /**
   * Updates the status of a donation.
   * @param donationId - ID of the donation
   * @param status - New status
   */
  private async updateDonationStatus(donationId: string, status: Donation['status']) {
    return await this.apiClient.updateByID({
      collection: 'donations',
      id: donationId,
      data: { status },
    });
  }

  /**
   * Updates the status of a request.
   * @param requestId - ID of the request
   * @param status - New status
   */
  private async updateRequestStatus(requestId: string, status: Request['status']) {
    return await this.apiClient.updateByID({
      collection: 'requests',
      id: requestId,
      data: { status },
    });
  }

  /**
   * Handles all required updates when a transaction is finalized.
   * @param transaction - The completed transaction
   */
  private async finalizeTransaction(transaction: Partial<Transaction>): Promise<void> {
    const P2P = TRANSACTION_TYPE.P2P.value;
    const P2O = TRANSACTION_TYPE.P2O.value;
    const O2P = TRANSACTION_TYPE.O2P.value;

    // For P2P transactions, update donation and request statuses
    if (transaction.transactionType === P2P) {
      if (!transaction.donation || !transaction.request) {
        throw new Error('P2P transaction must have both donation and request');
      }

      await this.updateDonationStatus(extractID(transaction.donation), 'COMPLETED');
      await this.updateRequestStatus(extractID(transaction.request), 'COMPLETED');

      // Update milk bags to CONSUMED
      for (const bagId of transaction.matchedBags || []) {
        await this.updateMilkBagStatus([extractID(bagId)], 'CONSUMED');
      }
    }

    // For P2O transactions, update donation status and create inventory entry
    else if (transaction.transactionType === P2O) {
      if (!transaction.donation) {
        throw new Error('P2O transaction must have a donation');
      }

      await this.updateDonationStatus(extractID(transaction.donation), 'COMPLETED');

      // The inventory creation will be handled by the processDonationToOrganization hook
      // so we don't need to create it here
    }

    // For O2P transactions, update request status
    else if (transaction.transactionType === O2P) {
      if (!transaction.request) {
        throw new Error('O2P transaction must have a request');
      }

      await this.updateRequestStatus(extractID(transaction.request), 'COMPLETED');

      // Update milk bags to CONSUMED
      for (const bagId of transaction.matchedBags || []) {
        await this.updateMilkBagStatus([extractID(bagId)], 'CONSUMED');
      }
    }
  }
  // #endregion
}
