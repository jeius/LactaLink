import { Collection, IApiClient } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { DeliveryMode, TransactionService } from '../TransactionService';
import {
  DonationMatchCriteria,
  MatchOptions,
  MatchResult,
  O2PMatchOptions,
  O2PMatchResult,
  P2OMatchOptions,
  P2OMatchResult,
  RequestMatchCriteria,
} from './types';

/**
 * Service for matching donations to requests and managing their lifecycle.
 */
export class MatchingService {
  private apiClient: IApiClient;
  private transactionService: TransactionService;

  /**
   * Creates a new MatchingService instance.
   * @param apiClient - The API client used for backend communication
   */
  constructor(apiClient: IApiClient) {
    this.apiClient = apiClient;
    this.transactionService = new TransactionService(apiClient);
  }

  /**
   * Finds compatible donations for a request based on specified criteria.
   * @param requestId - ID of the request to find donations for
   * @param criteria - Matching criteria
   * @returns List of compatible donations
   */
  async findMatchingDonations(
    requestId: string,
    criteria: DonationMatchCriteria = {}
  ): Promise<Collection<'donations'>[]> {
    // Get the request details
    const request = await this.apiClient.findByID<'requests'>({
      collection: 'requests',
      id: requestId,
    });

    // Build query conditions
    const whereConditions: any = {
      status: { equals: 'AVAILABLE' },
    };

    // Filter by minimum volume if needed
    if (criteria.minVolume || request.remainingNeeded) {
      whereConditions.remainingVolume = {
        greater_than: criteria.minVolume || request.remainingNeeded || 0,
      };
    }

    // Filter by storage type
    if (criteria.storageType && criteria.storageType !== 'EITHER') {
      whereConditions['details.storageType'] = { equals: criteria.storageType };
    } else if (
      request.details?.storagePreference &&
      request.details.storagePreference !== 'EITHER'
    ) {
      whereConditions['details.storageType'] = { equals: request.details.storagePreference };
    }

    // Exclude specific donations
    if (criteria.excludeDonationIds?.length) {
      whereConditions.id = { not_in: criteria.excludeDonationIds };
    }

    // Filter by donor
    if (criteria.donorId) {
      whereConditions.donor = { equals: criteria.donorId };
    }

    // Exclude specific donors
    if (criteria.excludeDonorIds?.length) {
      if (!whereConditions.donor) whereConditions.donor = {};
      whereConditions.donor.not_in = criteria.excludeDonorIds;
    }

    // Find matching donations
    const result = await this.apiClient.find<'donations'>({
      collection: 'donations',
      where: whereConditions,
      sort: 'expiredAt', // Sort by expiry date (oldest first) to use older milk first
      limit: 50,
    });

    return result as Collection<'donations'>[];
  }

  /**
   * Finds compatible requests for a donation based on specified criteria.
   * @param donationId - ID of the donation to find requests for
   * @param criteria - Matching criteria
   * @returns List of compatible requests
   */
  async findMatchingRequests(
    donationId: string,
    criteria: RequestMatchCriteria = {}
  ): Promise<Collection<'requests'>[]> {
    // ... existing code ...
    const donation = await this.apiClient.findByID<'donations'>({
      collection: 'donations',
      id: donationId,
    });

    // Build query conditions
    const whereConditions: any = {
      status: { equals: 'AVAILABLE' },
    };

    // Filter by volume
    if (criteria.maxVolume || donation.remainingVolume) {
      whereConditions.remainingNeeded = {
        less_than_equal: criteria.maxVolume || donation.remainingVolume || 0,
      };
    }

    // Filter by storage type
    if (criteria.storageType) {
      whereConditions['details.storagePreference'] = {
        in: [criteria.storageType, 'EITHER'],
      };
    } else if (donation.details?.storageType) {
      whereConditions['details.storagePreference'] = {
        in: [donation.details.storageType, 'EITHER'],
      };
    }

    // Exclude specific requests
    if (criteria.excludeRequestIds?.length) {
      whereConditions.id = { not_in: criteria.excludeRequestIds };
    }

    // Filter by requester
    if (criteria.requesterId) {
      whereConditions.requester = { equals: criteria.requesterId };
    }

    // Exclude specific requesters
    if (criteria.excludeRequesterIds?.length) {
      if (!whereConditions.requester) whereConditions.requester = {};
      whereConditions.requester.not_in = criteria.excludeRequesterIds;
    }

    // Sort by urgency if requested, otherwise by creation date
    const sort = criteria.prioritizeUrgent
      ? [
          { field: 'details.urgency', direction: 'desc' },
          { field: 'createdAt', direction: 'asc' },
        ]
      : 'createdAt';

    // Find matching requests
    const result = await this.apiClient.find<'requests'>({
      collection: 'requests',
      where: whereConditions,
      sort,
      limit: 50,
    });

    return result as Collection<'requests'>[];
  }

  /**
   * Creates a match between a donation and request, with optional milk bag selection.
   * @param donationId - ID of the donation
   * @param requestId - ID of the request
   * @param options - Optional parameters like specific milk bags to match
   * @returns Match result including transaction and updated donation/request
   */
  async createMatch(
    donationId: string,
    requestId: string,
    options: MatchOptions = {}
  ): Promise<MatchResult> {
    // ... existing code ...
    const [donation, request] = await Promise.all([
      this.apiClient.findByID({
        collection: 'donations',
        id: donationId,
      }),
      this.apiClient.findByID({
        collection: 'requests',
        id: requestId,
      }),
    ]);

    // Verify both are in AVAILABLE status
    if (donation.status !== 'AVAILABLE') {
      throw new Error(`Cannot match: donation ${donationId} is not available (${donation.status})`);
    }

    if (request.status !== 'AVAILABLE') {
      throw new Error(`Cannot match: request ${requestId} is not available (${request.status})`);
    }

    // Determine milk bags to match
    let milkBagIds = options.milkBagIds;
    let matchedBags = [];

    if (!milkBagIds?.length) {
      // Auto-select milk bags to match the request volume
      const allMilkBags = await this.apiClient.find({
        collection: 'milkBags',
        pagination: false,
        sort: 'createdAt', // Sort by creation date to use older milk first
        where: {
          id: { in: extractID(donation.details?.bags || []) },
          status: { equals: 'AVAILABLE' },
        },
      });

      // Select bags until we reach the needed volume
      let totalVolume = 0;
      const neededVolume = request.remainingNeeded || request.volumeNeeded;
      const selectedBags = [];

      for (const bag of allMilkBags) {
        selectedBags.push(bag);
        totalVolume += bag.volume || 0;

        if (totalVolume >= neededVolume) break;
      }

      matchedBags = selectedBags;
      milkBagIds = selectedBags.map((bag) => bag.id);
    } else {
      // Fetch the specified milk bags
      const docs = await this.apiClient.find({
        collection: 'milkBags',
        pagination: false,
        where: {
          id: { in: milkBagIds },
          status: { equals: 'AVAILABLE' },
        },
      });
      matchedBags = docs;
    }

    if (!matchedBags.length) {
      throw new Error(`No available milk bags found for donation ${donationId}`);
    }

    // Calculate total volume of matched bags
    const matchedVolume = matchedBags.reduce((sum, bag) => sum + (bag.volume || 0), 0);

    // Create the transaction using the TransactionService
    const transaction = await this.transactionService.createP2PTransaction({
      donationId,
      requestId,
      milkBagIds: matchedBags.map((bag) => bag.id),
      volume: matchedVolume,
      deliveryMode: options.deliveryMode as DeliveryMode,
      deliveryPreferenceId: options.deliveryPreferenceId,
    });

    // Calculate if the request is fully fulfilled
    const totalFulfilled = (request.volumeFulfilled || 0) + matchedVolume;
    const fullyFulfilled = totalFulfilled >= request.volumeNeeded;

    // Get the updated donation and request
    const [updatedDonation, updatedRequest] = await Promise.all([
      this.apiClient.findByID({
        collection: 'donations',
        id: donationId,
      }),
      this.apiClient.findByID({
        collection: 'requests',
        id: requestId,
      }),
    ]);

    return {
      transaction,
      donation: updatedDonation,
      request: updatedRequest,
      matchedBags,
      fullyFulfilled,
    };
  }

  /**
   * Creates a P2O match (donation to organization).
   * @param donationId - ID of the donation
   * @param organizationId - ID of the organization
   * @param organizationType - Type of the organization ('hospitals' or 'milkBanks')
   * @param options - Optional parameters like specific milk bags to match
   * @returns Match result including transaction
   */
  async createP2OMatch(
    donationId: string,
    organizationId: string,
    organizationType: 'hospitals' | 'milkBanks',
    options: P2OMatchOptions = {}
  ): Promise<P2OMatchResult> {
    // ... existing code ...
    const donation = await this.apiClient.findByID<'donations'>({
      collection: 'donations',
      id: donationId,
    });

    // Verify donation is available
    if (donation.status !== 'AVAILABLE') {
      throw new Error(`Cannot match: donation ${donationId} is not available (${donation.status})`);
    }

    // Determine milk bags to match
    let milkBagIds = options.milkBagIds;

    if (!milkBagIds?.length) {
      // Use all available milk bags from the donation
      const { docs: allMilkBags } = await this.apiClient.find<'milkBags'>({
        collection: 'milkBags',
        pagination: false,
        where: {
          id: { in: extractID(donation.details?.bags || []) },
          status: { equals: 'AVAILABLE' },
        },
      });

      milkBagIds = allMilkBags.map((bag) => bag.id);
    }

    if (!milkBagIds.length) {
      throw new Error(`No available milk bags found for donation ${donationId}`);
    }

    // Calculate total volume of matched bags
    const { docs: matchedBags } = await this.apiClient.find<'milkBags'>({
      collection: 'milkBags',
      pagination: false,
      where: {
        id: { in: milkBagIds },
      },
    });

    const matchedVolume = matchedBags.reduce((sum, bag) => sum + (bag.volume || 0), 0);

    // Create the transaction using the TransactionService
    const transaction = await this.transactionService.createP2OTransaction({
      donationId,
      organizationId,
      organizationType,
      milkBagIds,
      volume: matchedVolume,
    });

    // Get the updated donation
    const updatedDonation = await this.apiClient.findByID<'donations'>({
      collection: 'donations',
      id: donationId,
    });

    return {
      transaction,
      donation: updatedDonation,
    };
  }

  /**
   * Creates an O2P match (organization to request).
   * @param organizationId - ID of the organization
   * @param organizationType - Type of the organization ('hospitals' or 'milkBanks')
   * @param requestId - ID of the request
   * @param options - Optional parameters like specific milk bags to match
   * @returns Match result including transaction and updated request
   */
  async createO2PMatch(
    organizationId: string,
    organizationType: 'hospitals' | 'milkBanks',
    requestId: string,
    options: O2PMatchOptions
  ): Promise<O2PMatchResult> {
    // ... existing code ...
    // Require milk bag IDs for O2P matches since they come from inventory
    if (!options.milkBagIds?.length) {
      throw new Error('Milk bag IDs must be provided for organization-to-request matches');
    }

    // Fetch request and verify milk bags
    const [request, { docs: milkBags }] = await Promise.all([
      this.apiClient.findByID<'requests'>({
        collection: 'requests',
        id: requestId,
      }),
      this.apiClient.find<'milkBags'>({
        collection: 'milkBags',
        pagination: false,
        where: {
          id: { in: options.milkBagIds },
          owner: {
            relationTo: { equals: organizationType },
            value: { equals: organizationId },
          },
        },
      }),
    ]);

    // Verify request is available
    if (request.status !== 'AVAILABLE' && request.status !== 'PENDING') {
      throw new Error(`Cannot match: request ${requestId} is not available (${request.status})`);
    }

    // Verify all milk bags belong to the organization
    if (milkBags.length !== options.milkBagIds.length) {
      throw new Error('Some milk bags do not belong to the specified organization');
    }

    // Calculate total volume of matched bags
    const matchedVolume = milkBags.reduce((sum, bag) => sum + (bag.volume || 0), 0);

    // Create the transaction using the TransactionService
    const transaction = await this.transactionService.createO2PTransaction({
      organizationId,
      organizationType,
      requestId,
      milkBagIds: options.milkBagIds,
      volume: matchedVolume,
    });

    // Get the updated request
    const updatedRequest = await this.apiClient.findByID<'requests'>({
      collection: 'requests',
      id: requestId,
    });

    return {
      transaction,
      request: updatedRequest,
    };
  }

  /**
   * Updates a donation's status based on its current state.
   * @param donationId - ID of the donation to update
   * @returns Updated donation
   */
  async updateDonationLifecycle(donationId: string) {
    // ... existing code ...
    const donation = await this.apiClient.findByID<'donations'>({
      collection: 'donations',
      id: donationId,
    });

    // Skip already completed/expired/cancelled donations
    const finalStatuses = ['COMPLETED', 'EXPIRED', 'CANCELLED'];
    if (finalStatuses.includes(donation.status)) {
      return donation;
    }

    // Get associated milk bags to determine current state
    const { docs: milkBags } = await this.apiClient.find<'milkBags'>({
      collection: 'milkBags',
      pagination: false,
      where: {
        id: { in: extractID(donation.details?.bags || []) },
      },
    });

    // Count bags by status
    const statusCounts = milkBags.reduce(
      (acc, bag) => {
        acc[bag.status] = (acc[bag.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalBags = milkBags.length;
    const availableBags = statusCounts['AVAILABLE'] || 0;
    const allocatedBags = statusCounts['ALLOCATED'] || 0;
    const consumedBags = statusCounts['CONSUMED'] || 0;

    // Calculate remaining volume
    const remainingVolume = milkBags
      .filter((bag) => bag.status === 'AVAILABLE')
      .reduce((sum, bag) => sum + (bag.volume || 0), 0);

    // Determine appropriate status
    let newStatus = donation.status;

    if (consumedBags === totalBags) {
      newStatus = 'COMPLETED';
    } else if (availableBags === 0 && allocatedBags > 0) {
      newStatus = 'FULLY_ALLOCATED';
    } else if (allocatedBags > 0 && availableBags > 0) {
      newStatus = 'PARTIALLY_ALLOCATED';
    } else if (statusCounts['EXPIRED'] === totalBags) {
      newStatus = 'EXPIRED';
    }

    // Only update if status or volume changed
    if (newStatus !== donation.status || remainingVolume !== donation.remainingVolume) {
      return await this.apiClient.updateByID<'donations'>({
        collection: 'donations',
        id: donationId,
        data: {
          status: newStatus,
          remainingVolume,
        },
      });
    }

    return donation;
  }

  /**
   * Updates a request's status based on its current state.
   * @param requestId - ID of the request to update
   * @returns Updated request
   */
  async updateRequestLifecycle(requestId: string) {
    // ... existing code ...
    const request = await this.apiClient.findByID<'requests'>({
      collection: 'requests',
      id: requestId,
    });

    // Skip already completed/expired/cancelled requests
    const finalStatuses = ['COMPLETED', 'EXPIRED', 'CANCELLED'];
    if (finalStatuses.includes(request.status)) {
      return request;
    }

    // Check if request has expired
    if (request.details?.neededAt) {
      const neededByDate = new Date(request.details.neededAt);
      if (neededByDate < new Date() && request.status !== 'COMPLETED') {
        return await this.apiClient.updateByID<'requests'>({
          collection: 'requests',
          id: requestId,
          data: {
            status: 'EXPIRED',
            expiredAt: new Date().toISOString(),
          },
        });
      }
    }

    // Get transactions to determine fulfillment
    const { docs: transactions } = await this.apiClient.find<'transactions'>({
      collection: 'transactions',
      pagination: false,
      where: {
        request: { equals: requestId },
        status: { not_equals: 'CANCELLED' },
      },
    });

    // Calculate volume from matched transactions
    const volumeFulfilled = transactions.reduce((sum, txn) => sum + (txn.matchedVolume || 0), 0);

    // Determine if request is fully fulfilled
    const fullyFulfilled = volumeFulfilled >= request.volumeNeeded;

    // Update request status and fulfilled volume
    let newStatus = request.status;

    if (fullyFulfilled && request.status !== 'COMPLETED') {
      newStatus = 'COMPLETED';
    } else if (transactions.length > 0 && !fullyFulfilled && request.status !== 'MATCHED') {
      newStatus = 'MATCHED';
    }

    // Only update if status or fulfilled volume changed
    if (newStatus !== request.status || volumeFulfilled !== request.volumeFulfilled) {
      return await this.apiClient.updateByID<'requests'>({
        collection: 'requests',
        id: requestId,
        data: {
          status: newStatus,
          volumeFulfilled,
          ...(newStatus === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {}),
        },
      });
    }

    return request;
  }

  /**
   * Gets the best matching donations for a request.
   * @param requestId - ID of the request
   * @param limit - Maximum number of donations to return
   * @returns List of compatible donations
   */
  async getRecommendedDonationsForRequest(
    requestId: string,
    limit: number = 5
  ): Promise<Collection<'donations'>[]> {
    return this.findMatchingDonations(requestId, {
      prioritizeUrgent: true,
    }).then((donations) => donations.slice(0, limit));
  }

  /**
   * Gets the best matching requests for a donation.
   * @param donationId - ID of the donation
   * @param limit - Maximum number of requests to return
   * @returns List of compatible requests
   */
  async getRecommendedRequestsForDonation(
    donationId: string,
    limit: number = 5
  ): Promise<Collection<'requests'>[]> {
    return this.findMatchingRequests(donationId, {
      prioritizeUrgent: true,
    }).then((requests) => requests.slice(0, limit));
  }
}

export * from './types';
