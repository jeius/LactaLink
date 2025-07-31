import { DELIVERY_OPTIONS, TRANSACTION_STATUS } from '@lactalink/enums';
import { Delivery, Donation, IApiClient, MilkBag, Request, Transaction } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import {
  CreateO2PTransactionParams,
  CreateP2OTransactionParams,
  CreateP2PTransactionParams,
  DeliveryAgreementParams,
  DeliveryDetailsParams,
  DeliveryMode,
  PartyType,
  TransactionStatus,
  TransactionType,
} from './types';

/**
 * Service for managing transactions throughout their lifecycle.
 * Handles creation, status updates, delivery scheduling, and completion.
 */
export class TransactionService {
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
  /**
   * Creates a new P2P (Peer to Peer) transaction between donor and requester.
   * @param params - Transaction parameters
   * @returns The created transaction
   */
  async createP2PTransaction(params: CreateP2PTransactionParams): Promise<Transaction> {
    const { donationID, requestID, milkBagIDs, delivery } = params;

    const [donation, request] = await Promise.all([
      this.getDonation(donationID),
      this.getRequest(requestID),
    ]);

    const status = delivery
      ? TRANSACTION_STATUS.DELIVERY_SCHEDULED.value
      : TRANSACTION_STATUS.MATCHED.value;

    const volume = await this.getVolume(milkBagIDs);

    let deliveryDetails: Delivery['confirmedDelivery'];
    if (delivery) {
      deliveryDetails = {
        mode: delivery.mode,
        datetime: delivery.datetime,
        address: delivery.address,
        confirmedAt: new Date().toISOString(),
      };
    }

    // Create the transaction
    const transaction = await this.apiClient.create({
      collection: 'transactions',
      data: {
        transactionType: TransactionType.P2P,
        status: status,
        donation: donationID,
        sender: { relationTo: 'individuals', value: extractID(donation.donor) },
        request: requestID,
        recipient: { relationTo: 'individuals', value: extractID(request.requester) },
        matchedBags: milkBagIDs,
        matchedVolume: volume,
        delivery: {
          instructions: params.instructions,
          confirmedDelivery: deliveryDetails,
        },
      },
    });

    // Update milk bags to ALLOCATED status
    await this.updateMilkBagStatus(milkBagIDs, 'ALLOCATED');

    // Update donation and request statuses to MATCHED
    await this.updateDonationStatus(donationID, 'MATCHED');
    await this.updateRequestStatus(requestID, 'MATCHED');

    return transaction;
  }

  /**
   * Creates a new P2O (Peer to Organization) transaction.
   * For donations directly to an organization with fixed DELIVERY mode.
   * @param params - Transaction parameters
   * @returns The created transaction
   */
  async createP2OTransaction(params: CreateP2OTransactionParams): Promise<Transaction> {
    const { donationID, organization, milkBagIDs, addressID } = params;

    const [donation, volume] = await Promise.all([
      this.getDonation(donationID),
      this.getVolume(milkBagIDs),
    ]);

    // P2O transactions always use DELIVERY mode and are automatically scheduled
    const transaction = await this.apiClient.create({
      collection: 'transactions',
      data: {
        transactionType: TransactionType.P2O,
        status: TRANSACTION_STATUS.DELIVERY_SCHEDULED.value,
        donation: donation.id,
        sender: { relationTo: 'individuals', value: extractID(donation.donor) },
        recipient: organization,
        matchedBags: milkBagIDs,
        matchedVolume: volume,
        delivery: {
          confirmedDelivery: {
            confirmedAt: new Date().toISOString(),
            mode: DELIVERY_OPTIONS.DELIVERY.value,
            address: addressID,
          },
        },
      },
    });

    // Update milk bags to ALLOCATED status
    await this.updateMilkBagStatus(milkBagIDs, 'ALLOCATED');

    // Update donation status to MATCHED
    await this.updateDonationStatus(donationID, 'MATCHED');

    return transaction;
  }

  /**
   * Creates a new O2P (Organization to Peer) transaction.
   * For organization fulfilling a request with fixed PICKUP mode.
   * @param params - Transaction parameters
   * @returns The created transaction
   */
  async createO2PTransaction(params: CreateO2PTransactionParams): Promise<Transaction> {
    const { organization, requestID, milkBagIDs, addressID } = params;

    const [request, volume] = await Promise.all([
      this.getRequest(requestID),
      this.getVolume(milkBagIDs),
    ]);

    // O2P transactions always use PICKUP mode and are automatically scheduled
    const transaction = await this.apiClient.create<'transactions'>({
      collection: 'transactions',
      data: {
        transactionType: TransactionType.O2P,
        status: TransactionStatus.DELIVERY_SCHEDULED,
        request: requestID,
        sender: organization,
        recipient: { relationTo: 'individuals', value: extractID(request.requester) },
        matchedBags: milkBagIDs,
        matchedVolume: volume,
        delivery: {
          confirmedDelivery: {
            mode: DELIVERY_OPTIONS.PICKUP.value,
            confirmedAt: new Date().toISOString(),
            address: addressID,
          },
        },
      },
    });

    // Update milk bags to ALLOCATED status
    await this.updateMilkBagStatus(milkBagIDs, 'ALLOCATED');

    // Update request status to MATCHED
    await this.updateRequestStatus(requestID, 'MATCHED');

    return transaction;
  }
  // #endregion

  // #region Delivery Proposal Methods
  /**
   * Proposes delivery details for a transaction, initiating the negotiation process.
   * @param transactionId - ID of the transaction
   * @param details - Delivery details
   * @param proposedBy - Who proposed the details ('DONOR' or 'REQUESTER')
   * @returns Updated transaction
   */
  async proposeDeliveryDetails(
    transactionId: string,
    details: DeliveryDetailsParams
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID({
      collection: 'transactions',
      id: transactionId,
    });

    const matchedStatus = TRANSACTION_STATUS.MATCHED.value;
    const pendingDeliveryStatus = TRANSACTION_STATUS.PENDING_DELIVERY_CONFIRMATION.value;

    // Can only propose delivery details for transactions in MATCHED and PENDING status
    if (transaction.status !== matchedStatus && transaction.status !== pendingDeliveryStatus) {
      throw new Error(
        `Cannot propose delivery details for transaction in ${transaction.status} status`
      );
    }

    // Update the transaction with proposed details
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: pendingDeliveryStatus,
        delivery: {},
      },
    });
  }

  /**
   * Accepts proposed delivery details and schedules the delivery.
   * @param transactionId - ID of the transaction
   * @param timeSlotId - ID of the accepted time slot
   * @param addressId - ID of the accepted address
   * @returns Updated transaction
   */
  async acceptDeliveryDetails(
    transactionId: string,
    timeSlotId: string,
    addressId: string
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
    });

    // Can only accept delivery details for transactions in PENDING_DELIVERY_CONFIRMATION status
    if (transaction.status !== TransactionStatus.PENDING_DELIVERY_CONFIRMATION) {
      throw new Error(
        `Cannot accept delivery details for transaction in ${transaction.status} status`
      );
    }

    // Find the selected time slot
    const selectedTimeSlot = transaction.delivery.details_proposed_time_slots?.find(
      (slot) => slot.id === timeSlotId
    );
    if (!selectedTimeSlot) {
      throw new Error(`Time slot with ID ${timeSlotId} not found`);
    }

    // Find the selected address
    const selectedAddress = transaction.delivery.details_proposed_addresses?.find(
      (addr) => addr.address_id === addressId
    );
    if (!selectedAddress) {
      throw new Error(`Address with ID ${addressId} not found`);
    }

    // Update the transaction with confirmed details
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: TransactionStatus.DELIVERY_SCHEDULED,
        delivery: {
          ...transaction.delivery,
          status: 'SCHEDULED',
          details_confirmed_time_slot_date: selectedTimeSlot.date,
          details_confirmed_time_slot_time_slot_type: selectedTimeSlot.time_slot_type,
          details_confirmed_time_slot_time_slot_preset_slot: selectedTimeSlot.time_slot_preset_slot,
          details_confirmed_time_slot_time_slot_custom_time_start_time:
            selectedTimeSlot.time_slot_custom_time_start_time,
          details_confirmed_time_slot_time_slot_custom_time_end_time:
            selectedTimeSlot.time_slot_custom_time_end_time,
          details_confirmed_address_id: selectedAddress.address_id,
        },
      },
    });
  }
  // #endregion

  // #region Delivery Execution Methods
  /**
   * Updates the transaction status to READY_FOR_PICKUP (donor confirms milk is ready).
   * Only applicable for PICKUP mode transactions.
   * @param transactionId - ID of the transaction
   * @returns Updated transaction
   */
  async readyForPickup(transactionId: string): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
    });

    // Can only set as ready for pickup if in DELIVERY_SCHEDULED status and mode is PICKUP
    if (transaction.status !== TransactionStatus.DELIVERY_SCHEDULED) {
      throw new Error(
        `Cannot mark as ready for pickup: transaction is in ${transaction.status} status`
      );
    }

    if (transaction.delivery.mode !== DeliveryMode.PICKUP) {
      throw new Error(
        `Cannot mark as ready for pickup: transaction mode is ${transaction.delivery.mode}`
      );
    }

    // Update transaction status
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: TransactionStatus.READY_FOR_PICKUP,
        delivery: {
          ...transaction.delivery,
          status: 'READY_FOR_PICKUP',
          tracking_tracking_history: [
            ...(transaction.delivery.tracking_tracking_history || []),
            {
              status: 'READY_FOR_PICKUP',
              timestamp: new Date().toISOString(),
              notes: 'Donor confirmed milk is ready for pickup',
            },
          ],
        },
      },
    });
  }

  /**
   * Updates the transaction status to IN_TRANSIT (donor starts delivery journey).
   * Only applicable for DELIVERY mode transactions.
   * @param transactionId - ID of the transaction
   * @returns Updated transaction
   */
  async startTransit(transactionId: string): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
    });

    // Can only start transit if in DELIVERY_SCHEDULED status and mode is DELIVERY
    if (transaction.status !== TransactionStatus.DELIVERY_SCHEDULED) {
      throw new Error(`Cannot start transit: transaction is in ${transaction.status} status`);
    }

    if (transaction.delivery.mode !== DeliveryMode.DELIVERY) {
      throw new Error(`Cannot start transit: transaction mode is ${transaction.delivery.mode}`);
    }

    // Update transaction status
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: TransactionStatus.IN_TRANSIT,
        delivery: {
          ...transaction.delivery,
          status: 'IN_TRANSIT',
          tracking_tracking_history: [
            ...(transaction.delivery.tracking_tracking_history || []),
            {
              status: 'IN_TRANSIT',
              timestamp: new Date().toISOString(),
              notes: 'Donor started delivery journey',
            },
          ],
        },
      },
    });
  }

  /**
   * Marks the transaction as DELIVERED (milk physically transferred).
   * @param transactionId - ID of the transaction
   * @returns Updated transaction
   */
  async markDelivered(transactionId: string): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
    });

    // Can only mark as delivered from certain statuses
    const validStatuses = [
      TransactionStatus.DELIVERY_SCHEDULED,
      TransactionStatus.READY_FOR_PICKUP,
      TransactionStatus.IN_TRANSIT,
    ];

    if (!validStatuses.includes(transaction.status as TransactionStatus)) {
      throw new Error(`Cannot mark as delivered: transaction is in ${transaction.status} status`);
    }

    // Update transaction status
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: TransactionStatus.DELIVERED,
        delivery: {
          ...transaction.delivery,
          status: 'DELIVERED',
          tracking_delivered_at: new Date().toISOString(),
          tracking_tracking_history: [
            ...(transaction.delivery.tracking_tracking_history || []),
            {
              status: 'DELIVERED',
              timestamp: new Date().toISOString(),
              notes: 'Milk successfully delivered',
            },
          ],
        },
      },
    });
  }
  // #endregion

  // #region Transaction Completion Methods
  /**
   * Completes the transaction (recipient verifies receipt and quality).
   * Only the recipient can complete a transaction.
   * @param transactionId - ID of the transaction
   * @returns Updated transaction
   */
  async completeTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
    });

    // Can only complete if in DELIVERED status
    if (transaction.status !== TransactionStatus.DELIVERED) {
      throw new Error(
        `Cannot complete transaction: transaction is in ${transaction.status} status`
      );
    }

    // Mark the transaction as completed
    const completedTransaction = await this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: TransactionStatus.COMPLETED,
        delivery: {
          ...transaction.delivery,
          tracking_tracking_history: [
            ...(transaction.delivery.tracking_tracking_history || []),
            {
              status: 'COMPLETED',
              timestamp: new Date().toISOString(),
              notes: 'Transaction completed and verified by recipient',
            },
          ],
        },
      },
    });

    // Update related entities
    await this.finalizeTransaction(transaction);

    return completedTransaction;
  }
  // #endregion

  // #region Transaction Failure/Cancellation Methods
  /**
   * Marks a transaction as failed with a reason.
   * @param transactionId - ID of the transaction
   * @param reason - Reason for failure
   * @returns Updated transaction
   */
  async failTransaction(transactionId: string, reason: string): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
    });

    // Cannot fail if already completed
    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new Error('Cannot fail a completed transaction');
    }

    // Mark the transaction as failed
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: TransactionStatus.FAILED,
        delivery: {
          ...transaction.delivery,
          status: 'FAILED',
          tracking_failure_reason: reason,
          tracking_tracking_history: [
            ...(transaction.delivery.tracking_tracking_history || []),
            {
              status: 'FAILED',
              timestamp: new Date().toISOString(),
              notes: `Transaction failed: ${reason}`,
            },
          ],
        },
      },
    });
  }

  /**
   * Cancels a transaction with a reason.
   * @param transactionId - ID of the transaction
   * @param reason - Reason for cancellation
   * @returns Updated transaction
   */
  async cancelTransaction(transactionId: string, reason: string): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
    });

    // Cannot cancel if already completed
    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed transaction');
    }

    // Mark the transaction as cancelled
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: TransactionStatus.CANCELLED,
        delivery: {
          ...transaction.delivery,
          status: 'CANCELLED',
          tracking_tracking_history: [
            ...(transaction.delivery.tracking_tracking_history || []),
            {
              status: 'CANCELLED',
              timestamp: new Date().toISOString(),
              notes: `Transaction cancelled: ${reason}`,
            },
          ],
        },
      },
    });
  }
  // #endregion

  // #region Transaction Query Methods
  /**
   * Gets a transaction by ID.
   * @param transactionId - ID of the transaction
   * @returns The transaction
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    return this.apiClient.findByID({
      collection: 'transactions',
      id: transactionId,
    });
  }

  /**
   * Gets all paginated transactions for a user (as donor or requester).
   * @param profileID - ID of the user profile
   * @returns List of transactions
   */
  async getUserTransactions(profileID: string, options?: FindArgs<'transactions', true>) {
    const result = await this.apiClient.find({
      ...options,
      collection: 'transactions',
      sort: options?.sort || '-createdAt',
      where: {
        and: [
          {
            or: [
              { 'donation.donor': { equals: profileID } },
              { 'request.requester': { equals: profileID } },
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
   * @param milkBagIds - IDs of the milk bags
   * @returns Total volume
   */
  private async getVolume(milkBagIds: string[]): Promise<number> {
    const milkBags = await this.apiClient.find({
      collection: 'milkBags',
      where: {
        id: { in: milkBagIds },
      },
      pagination: false,
    });

    return milkBags.reduce((total, bag) => total + (bag.volume || 0), 0);
  }

  /**
   *
   * @param donationId  ID of the donation
   * @returns The donation object
   */
  private async getDonation(donationId: string): Promise<Donation> {
    return this.apiClient.findByID({
      collection: 'donations',
      id: donationId,
      depth: 0,
    });
  }

  /**
   *
   * @param requestId  ID of the request
   * @returns  The request object
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
  private async updateMilkBagStatus(bagIds: string[], status: MilkBag['status']): Promise<void> {
    for (const bagId of bagIds) {
      await this.apiClient.updateByID({
        collection: 'milkBags',
        id: bagId,
        data: { status },
      });
    }
  }

  /**
   * Updates the status of a donation.
   * @param donationId - ID of the donation
   * @param status - New status
   */
  private async updateDonationStatus(
    donationId: string,
    status: Donation['status']
  ): Promise<void> {
    await this.apiClient.updateByID({
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
  private async updateRequestStatus(requestId: string, status: Request['status']): Promise<void> {
    await this.apiClient.updateByID({
      collection: 'requests',
      id: requestId,
      data: { status },
    });
  }

  /**
   * Handles all required updates when a transaction is finalized.
   * @param transaction - The completed transaction
   */
  private async finalizeTransaction(transaction: Transaction): Promise<void> {
    // For P2P transactions, update donation and request statuses
    if (transaction.transactionType === TransactionType.P2P) {
      await this.updateDonationStatus(extractID(transaction.donation), 'COMPLETED');
      await this.updateRequestStatus(extractID(transaction.request), 'COMPLETED');

      // Update milk bags to CONSUMED
      for (const bagId of transaction.matchedBags || []) {
        await this.updateMilkBagStatus([extractID(bagId)], 'ALLOCATED');
      }
    }

    // For P2O transactions, update donation status and create inventory entry
    else if (transaction.transactionType === TransactionType.P2O) {
      await this.updateDonationStatus(extractID(transaction.donation), 'COMPLETED');

      // The inventory creation will be handled by the processDonationToOrganization hook
      // so we don't need to create it here
    }

    // For O2P transactions, update request status
    else if (transaction.transactionType === TransactionType.O2P) {
      await this.updateRequestStatus(extractID(transaction.request), 'COMPLETED');

      // Update milk bags to CONSUMED
      for (const bagId of transaction.matchedBags || []) {
        await this.updateMilkBagStatus([extractID(bagId)], 'ALLOCATED');
      }
    }
  }
  // #endregion

  // #region Delivery Agreement Methods
  /**
   * Registers agreement to a delivery proposal from one party.
   * @param transactionId - ID of the transaction
   * @param proposalIndex - Index of the delivery proposal in the array
   * @param partyType - Which party is agreeing (SENDER or RECIPIENT)
   * @param userId - ID of the user who is agreeing
   * @returns Updated transaction
   */
  async agreeToDeliveryProposal(
    transactionId: string,
    proposalIndex: number,
    partyType: PartyType,
    userId: string
  ): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
    });

    // Can only agree to delivery proposals in PENDING_DELIVERY_CONFIRMATION status
    if (transaction.status !== TransactionStatus.PENDING_DELIVERY_CONFIRMATION) {
      throw new Error(
        `Cannot agree to delivery proposal: transaction is in ${transaction.status} status`
      );
    }

    // Ensure the proposal exists
    if (
      !transaction.delivery.proposedDelivery ||
      !transaction.delivery.proposedDelivery[proposalIndex]
    ) {
      throw new Error(`Delivery proposal at index ${proposalIndex} not found`);
    }

    // Verify user is allowed to agree for this party
    await this.verifyUserCanActAsParty(transaction, partyType, userId);

    // Get the current proposal and determine which party field to update
    const partyField = partyType === 'SENDER' ? 'sender' : 'recipient';

    // Update the agreement data for this party
    const updatedProposals = [...(transaction.delivery.proposedDelivery || [])];
    updatedProposals[proposalIndex] = {
      ...updatedProposals[proposalIndex],
      agreements: {
        ...(updatedProposals[proposalIndex].agreements || {}),
        [partyField]: {
          agreed: true,
          agreedBy: userId,
          agreedAt: new Date().toISOString(),
        },
      },
    };

    // Check if both parties have agreed
    const senderAgreed = updatedProposals[proposalIndex]?.agreements?.sender?.agreed === true;
    const recipientAgreed = updatedProposals[proposalIndex]?.agreements?.recipient?.agreed === true;
    const bothPartiesAgreed = senderAgreed && recipientAgreed;

    // Update the bothPartiesAgreed flag
    if (bothPartiesAgreed) {
      updatedProposals[proposalIndex] = {
        ...updatedProposals[proposalIndex],
        agreements: {
          ...updatedProposals[proposalIndex].agreements,
          bothPartiesAgreed: true,
        },
      };

      // If both parties agreed, automatically proceed with this delivery proposal
      return this.acceptDeliveryProposal(transactionId, proposalIndex);
    }

    // Update the transaction with the new proposal data
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        delivery: {
          ...transaction.delivery,
          proposedDelivery: updatedProposals,
        },
      },
    });
  }

  /**
   * Accepts a specific delivery proposal and updates transaction status.
   * This is called automatically when both parties agree, or can be called
   * by an admin to force selection of a proposal.
   * @param transactionId - ID of the transaction
   * @param proposalIndex - Index of the delivery proposal in the array
   * @returns Updated transaction
   */
  async acceptDeliveryProposal(transactionId: string, proposalIndex: number): Promise<Transaction> {
    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
    });

    // Ensure the transaction is in the correct status
    if (transaction.status !== TransactionStatus.PENDING_DELIVERY_CONFIRMATION) {
      throw new Error(
        `Cannot accept delivery proposal: transaction is in ${transaction.status} status`
      );
    }

    // Ensure the proposal exists
    if (
      !transaction.delivery.proposedDelivery ||
      !transaction.delivery.proposedDelivery[proposalIndex]
    ) {
      throw new Error(`Delivery proposal at index ${proposalIndex} not found`);
    }

    // Get the selected proposal
    const selectedProposal = transaction.delivery.proposedDelivery[proposalIndex];

    // Update the transaction with confirmed details
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: TransactionStatus.DELIVERY_SCHEDULED,
        delivery: {
          ...transaction.delivery,
          status: 'SCHEDULED',
          confirmedDelivery: {
            mode: selectedProposal.mode,
            datetime: selectedProposal.datetime,
            address: selectedProposal.address,
            confirmedAt: new Date().toISOString(),
          },
          tracking_tracking_history: [
            ...(transaction.delivery.tracking_tracking_history || []),
            {
              status: 'DELIVERY_SCHEDULED',
              timestamp: new Date().toISOString(),
              notes: `Delivery scheduled with ${selectedProposal.mode} mode`,
            },
          ],
        },
      },
    });
  }

  /**
   * Proposes a new delivery option for a transaction.
   * @param transactionId - ID of the transaction
   * @param params - Delivery details parameters
   * @returns Updated transaction
   */
  async proposeDeliveryOption(
    transactionId: string,
    params: DeliveryAgreementParams
  ): Promise<Transaction> {
    const { mode, address, datetime, userId, partyType } = params;

    const transaction = await this.apiClient.findByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
    });

    // Verify transaction status
    const validStatuses = [
      TransactionStatus.MATCHED,
      TransactionStatus.PENDING_DELIVERY_CONFIRMATION,
    ];

    if (!validStatuses.includes(transaction.status as TransactionStatus)) {
      throw new Error(`Cannot propose delivery: transaction is in ${transaction.status} status`);
    }

    // Verify user is allowed to propose for this party
    await this.verifyUserCanActAsParty(transaction, partyType, userId);

    // Prepare the proposal data
    const proposalData = {
      mode,
      address,
      datetime,
      proposedBy: userId,
      proposedAt: new Date().toISOString(),
      agreements: {
        // Automatically mark the proposing party as agreed
        [partyType === 'SENDER' ? 'sender' : 'recipient']: {
          agreed: true,
          agreedBy: userId,
          agreedAt: new Date().toISOString(),
        },
      },
    };

    // Add the proposal to existing proposals or create a new array
    const proposedDelivery = [...(transaction.delivery.proposedDelivery || []), proposalData];

    // Update the transaction
    return this.apiClient.updateByID<'transactions'>({
      collection: 'transactions',
      id: transactionId,
      data: {
        status: TransactionStatus.PENDING_DELIVERY_CONFIRMATION,
        delivery: {
          ...transaction.delivery,
          status: 'PENDING_CONFIRMATION',
          proposedDelivery,
        },
      },
    });
  }

  /**
   * Verifies that a user is authorized to act on behalf of a party in a transaction.
   * @param transaction - The transaction
   * @param partyType - SENDER or RECIPIENT
   * @param userId - ID of the user
   */
  private async verifyUserCanActAsParty(
    transaction: Transaction,
    partyType: PartyType,
    userId: string
  ): Promise<void> {
    if (partyType === 'SENDER') {
      // For P2P and P2O, the sender is the donor
      if (transaction.donation) {
        const donation = await this.apiClient.findByID<'donations'>({
          collection: 'donations',
          id: extractID(transaction.donation),
          depth: 1,
        });

        if (extractID(donation.donor) !== userId) {
          throw new Error('User is not authorized to act as the sender in this transaction');
        }
      }
      // For O2P, the sender is the organization
      else if (transaction.organization) {
        // Would need to check if user belongs to organization, but this is a simplified check
        throw new Error('Organization authorization not implemented');
      }
    } else {
      // For P2P and O2P, the recipient is the requester
      if (transaction.request) {
        const request = await this.apiClient.findByID<'requests'>({
          collection: 'requests',
          id: extractID(transaction.request),
          depth: 1,
        });

        if (extractID(request.requester) !== userId) {
          throw new Error('User is not authorized to act as the recipient in this transaction');
        }
      }
      // For P2O, the recipient is the organization
      else if (transaction.organization) {
        // Would need to check if user belongs to organization, but this is a simplified check
        throw new Error('Organization authorization not implemented');
      }
    }
  }
  // #endregion
}
