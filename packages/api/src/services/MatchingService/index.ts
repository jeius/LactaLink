import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import {
  Donation,
  FetchGetResult,
  IApiClient,
  MatchCriteria,
  Request,
  SearchParams,
  User,
} from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { stringify } from 'qs-esm';
import { TransactionService } from '../TransactionService';
import {
  MatchOptions,
  MatchResult,
  O2PMatchOptions,
  O2PMatchResult,
  P2OMatchOptions,
  P2OMatchResult,
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
    options?: { criteria: MatchCriteria; fetchOptions?: SearchParams<'donations', boolean> }
  ): Promise<FetchGetResult<Donation>> {
    const { criteria, fetchOptions = {} } = options || {};

    fetchOptions.pagination =
      fetchOptions.pagination === undefined ? true : fetchOptions.pagination;

    const searchParams = stringify({ criteria, ...fetchOptions });
    return await this.apiClient.fetch(
      `/api/requests/${requestId}/matched-donations?${searchParams}`
    );
  }

  /**
   * Finds compatible requests for a donation based on specified criteria.
   * @param donationId - ID of the donation to find requests for
   * @param criteria - Matching criteria
   * @returns List of compatible requests
   */
  async findMatchingRequests(
    donationId: string,
    options?: { criteria: MatchCriteria; fetchOptions?: SearchParams<'requests', boolean> }
  ): Promise<FetchGetResult<Request>> {
    const { criteria, fetchOptions = {} } = options || {};

    fetchOptions.pagination =
      fetchOptions.pagination === undefined ? true : fetchOptions.pagination;

    const searchParams = stringify({ criteria, ...fetchOptions });
    return await this.apiClient.fetch(
      `/api/donations/${donationId}/matched-requests?${searchParams}`
    );
  }

  /**
   * Creates a match between a donation and request, with optional milk bag selection.
   * @param donationID - ID of the donation
   * @param requestID - ID of the request
   * @param options - Optional parameters like specific milk bags to match
   * @returns Match result including transaction and updated donation/request
   */
  async createMatch(
    donationID: string,
    requestID: string,
    options: MatchOptions
  ): Promise<MatchResult> {
    // ... existing code ...
    const [donation, request] = await Promise.all([
      this.apiClient.findByID({
        collection: 'donations',
        id: donationID,
      }),
      this.apiClient.findByID({
        collection: 'requests',
        id: requestID,
      }),
    ]);

    // Verify both are in AVAILABLE status
    if (donation.status !== DONATION_REQUEST_STATUS.AVAILABLE.value) {
      throw new Error(`Cannot match: donation ${donationID} is not available (${donation.status})`);
    }

    if (request.status !== DONATION_REQUEST_STATUS.AVAILABLE.value) {
      throw new Error(`Cannot match: request ${requestID} is not available (${request.status})`);
    }

    // Determine milk bags to match
    let milkBagIds = options.milkBagIDs;
    let matchedBags = [];

    if (!milkBagIds?.length) {
      // Auto-select milk bags to match the request volume
      const allMilkBags = await this.apiClient.find({
        collection: 'milkBags',
        pagination: false,
        sort: 'createdAt', // Sort by creation date to use older milk first
        where: {
          id: { in: extractID(donation.details?.bags || []) },
          status: { equals: MILK_BAG_STATUS.AVAILABLE.value },
        },
      });

      // Select bags until we reach the needed volume
      let totalVolume = 0;
      const neededVolume = request.volumeNeeded;
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
        where: { id: { in: milkBagIds } },
      });
      matchedBags = docs;
    }

    if (!matchedBags.length) {
      throw new Error(`No available milk bags found for donation ${donationID}`);
    }

    // Calculate total volume of matched bags
    const matchedVolume = matchedBags.reduce((sum, bag) => sum + (bag.volume || 0), 0);

    // Create the transaction using the TransactionService
    const createResult = await this.transactionService.createP2PTransaction({
      donation,
      request,
      milkBags: matchedBags,
      delivery: options.delivery,
      proposedDelivery: options.proposedDelivery,
      instructions: options.instructions,
    });

    // Calculate if the request is fully fulfilled
    const totalFulfilled = (request.volumeFulfilled || 0) + matchedVolume;
    const fullyFulfilled = totalFulfilled >= request.volumeNeeded;

    return {
      ...createResult,
      matchedBags: createResult.milkBags,
      fullyFulfilled,
    };
  }

  /**
   * Creates a P2O match (donation to organization).
   * @param donationId - ID of the donation
   * @param organization - Organization details (ID and type)
   * @param options - Optional parameters like specific milk bags to match
   * @returns Match result including transaction
   */
  async createP2OMatch(
    donationId: string,
    organization: Exclude<NonNullable<User['profile']>, { relationTo: 'individuals' }>,
    options: P2OMatchOptions
  ): Promise<P2OMatchResult> {
    // ... existing code ...
    const donation = await this.apiClient.findByID({
      collection: 'donations',
      id: donationId,
    });

    // Verify donation is available
    if (donation.status !== 'AVAILABLE') {
      throw new Error(`Cannot match: donation ${donationId} is not available (${donation.status})`);
    }

    // Determine milk bags to match
    let milkBagIds = options.milkBagIDs;

    if (!milkBagIds?.length) {
      milkBagIds = extractID(donation.details?.bags || []);
    }

    if (!milkBagIds.length) {
      throw new Error(`No available milk bags found for donation ${donationId}`);
    }

    // Calculate total volume of matched bags
    const matchedBags = await this.apiClient.find({
      collection: 'milkBags',
      pagination: false,
      where: { id: { in: milkBagIds } },
    });

    // Create the transaction using the TransactionService
    return await this.transactionService.createP2OTransaction({
      donation,
      organization,
      milkBags: extractID(matchedBags),
      address: options.address,
    });
  }

  /**
   * Creates an O2P match (organization to request).
   *
   * @param requestId - ID of the request
   * @param organization - Organization details (ID and type)
   * @param options - Optional parameters like specific milk bags to match
   * @returns Match result including transaction and updated request
   */
  async createO2PMatch(
    requestId: string,
    organization: Exclude<NonNullable<User['profile']>, { relationTo: 'individuals' }>,
    options: O2PMatchOptions
  ): Promise<O2PMatchResult> {
    // ... existing code ...
    // Require milk bag IDs for O2P matches since they come from inventory
    if (!options.milkBagIds?.length) {
      throw new Error('Milk bag IDs must be provided for organization-to-request matches');
    }

    // Fetch request and verify milk bags
    const [request, milkBags] = await Promise.all([
      this.apiClient.findByID({
        collection: 'requests',
        id: requestId,
      }),
      this.apiClient.find({
        collection: 'milkBags',
        pagination: false,
        where: {
          id: { in: options.milkBagIds },
          'owner.value': { equals: extractID(organization.value) },
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
    return await this.transactionService.createO2PTransaction({
      organization,
      request,
      milkBags,
      address: options.address,
    });
  }

  /**
   * Gets the best matching donations for a request.
   * @param requestId - ID of the request
   * @param limit - Maximum number of donations to return
   * @returns List of compatible donations
   */
  async getRecommendedDonationsForRequest(
    requestId: string,
    maxDistance?: number,
    limit: number = 5
  ): Promise<FetchGetResult<Donation>> {
    return this.findMatchingDonations(requestId, {
      criteria: {
        nearestFirst: true,
        status: 'AVAILABLE',
        matchBy: ['deliveryDays', 'deliveryMode', 'cityMunicipality'],
        maxDistance,
      },
      fetchOptions: { pagination: true, limit },
    });
  }

  /**
   * Gets the best matching requests for a donation.
   * @param donationId - ID of the donation
   * @param limit - Maximum number of requests to return
   * @returns List of compatible requests
   */
  async getRecommendedRequestsForDonation(
    donationId: string,
    maxDistance?: number,
    limit: number = 5
  ): Promise<FetchGetResult<Request>> {
    return this.findMatchingRequests(donationId, {
      criteria: {
        nearestFirst: true,
        status: 'AVAILABLE',
        matchBy: ['deliveryDays', 'deliveryMode', 'cityMunicipality'],
        maxDistance,
      },
      fetchOptions: { pagination: true, limit },
    });
  }

  //#region Helper Methods

  //#endregion
}
