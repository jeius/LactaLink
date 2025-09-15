import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { extractID } from '@lactalink/utilities/extractors';
import { stringify } from 'qs';
import { TransactionService } from '../TransactionService';

import type { DonationRequestStatus, NearOptions, Point } from '@lactalink/types';
import type { ApiFetchResponse, FindManyResult } from '@lactalink/types/api';
import type {
  CreateMatchOptions,
  FindMatchOptions,
  IApiClient,
  IMatchingService,
  O2PMatchOptions,
  P2OMatchOptions,
} from '@lactalink/types/interfaces';
import type { Transaction, User } from '@lactalink/types/payload-generated-types';
import type { SelectFromCollectionSlug } from '@lactalink/types/payload-types';

/**
 * Service for matching donations to requests and managing their lifecycle.
 */
export class MatchingService implements IMatchingService {
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

  async findMatchingDonations<
    TSelect extends SelectFromCollectionSlug<'donations'> = SelectFromCollectionSlug<'donations'>,
  >(
    requestId: string,
    options?: FindMatchOptions<'donations', TSelect>
  ): Promise<FindManyResult<'donations', TSelect, true>> {
    const { criteria, fetchOptions = {} } = options || {};

    fetchOptions.pagination =
      fetchOptions.pagination === undefined ? true : fetchOptions.pagination;

    const searchParams = stringify({ criteria, ...fetchOptions });
    return await this.apiClient.fetch(
      `/api/requests/${requestId}/matched-donations?${searchParams}`
    );
  }

  async findMatchingRequests<
    TSelect extends SelectFromCollectionSlug<'requests'> = SelectFromCollectionSlug<'requests'>,
  >(
    donationId: string,
    options?: FindMatchOptions<'requests', TSelect>
  ): Promise<FindManyResult<'requests', TSelect, true>> {
    const { criteria, fetchOptions = {} } = options || {};

    fetchOptions.pagination =
      fetchOptions.pagination === undefined ? true : fetchOptions.pagination;

    const searchParams = stringify({ criteria, ...fetchOptions });
    return await this.apiClient.fetch(
      `/api/donations/${donationId}/matched-requests?${searchParams}`
    );
  }

  async createMatch(
    donationID: string,
    requestID: string,
    options: CreateMatchOptions
  ): Promise<Transaction> {
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
    const transaction = await this.transactionService.createP2PTransaction({
      donation,
      request,
      milkBags: matchedBags,
    });

    // Calculate if the request is fully fulfilled
    const totalFulfilled = (request.volumeFulfilled || 0) + matchedVolume;
    const _fullyFulfilled = totalFulfilled >= request.volumeNeeded;

    return transaction;
  }

  async createP2OMatch(
    donationId: string,
    organization: Exclude<NonNullable<User['profile']>, { relationTo: 'individuals' }>,
    options: P2OMatchOptions
  ): Promise<Transaction> {
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

  async createO2PMatch(
    requestId: string,
    organization: Exclude<NonNullable<User['profile']>, { relationTo: 'individuals' }>,
    options: O2PMatchOptions
  ): Promise<Transaction> {
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

    // Create the transaction using the TransactionService
    return await this.transactionService.createO2PTransaction({
      organization,
      request,
      milkBags,
      address: options.address,
    });
  }

  async getRecommendedDonationsForRequest(
    requestId: string,
    maxDistance?: number,
    limit: number = 5
  ): Promise<FindManyResult<'donations', SelectFromCollectionSlug<'donations'>, true>> {
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

  async getRecommendedRequestsForDonation(
    donationId: string,
    maxDistance?: number,
    limit: number = 5
  ): Promise<FindManyResult<'requests', SelectFromCollectionSlug<'requests'>, true>> {
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

  async getNearestDonations(
    location: Point,
    status: DonationRequestStatus = 'AVAILABLE',
    maxDistance?: number,
    paginationOptions?: { page?: number; limit?: number }
  ): Promise<FindManyResult<'donations', SelectFromCollectionSlug<'donations'>, true>> {
    const options: NearOptions = { location, status, maxDistance };
    const paginationOpts = {
      page: paginationOptions?.page || 1,
      limit: paginationOptions?.limit || 10,
    };
    const res = await this.apiClient.fetch<
      ApiFetchResponse<FindManyResult<'donations', SelectFromCollectionSlug<'donations'>, true>>
    >(`/api/donations/near?${stringify({ options, ...paginationOpts })}`);

    if (!('data' in res)) {
      throw new Error('Failed to fetch nearest donations');
    }

    return res.data;
  }

  async getNearestRequests(
    location: Point,
    status: DonationRequestStatus = 'AVAILABLE',
    maxDistance?: number,
    paginationOptions?: { page?: number; limit?: number }
  ): Promise<FindManyResult<'requests', SelectFromCollectionSlug<'requests'>, true>> {
    const options: NearOptions = { location, status, maxDistance };
    const paginationOpts = {
      page: paginationOptions?.page || 1,
      limit: paginationOptions?.limit || 10,
    };

    const res = await this.apiClient.fetch<
      ApiFetchResponse<FindManyResult<'requests', SelectFromCollectionSlug<'requests'>, true>>
    >(`/api/requests/near?${stringify({ options, ...paginationOpts })}`);

    if (!('data' in res)) {
      throw new Error('Failed to fetch nearest requests');
    }

    return res.data as FindManyResult<'requests', SelectFromCollectionSlug<'requests'>, true>;
  }

  //#region Helper Methods

  //#endregion
}
