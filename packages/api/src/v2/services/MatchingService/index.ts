import type { ApiClient as IApiClient } from '@/v2/ApiClient';
import { MatchCriteria, NearDonationOrRequestOptions } from '@lactalink/form-schemas/validators';
import type { DonationRequestStatus, Point } from '@lactalink/types';
import type { FindManyResult } from '@lactalink/types/api';
import { Config } from '@lactalink/types/payload-generated-types';
import {
  CollectionSlug,
  FindOptions,
  SelectFromCollectionSlug,
} from '@lactalink/types/payload-types';

type Options<
  TSlug extends CollectionSlug<Config>,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = Omit<FindOptions<TSlug, TSelect>, 'collection' | 'draft' | 'overrideAccess'>;

export type FindMatchOptions<
  TSlug extends CollectionSlug<Config>,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = {
  criteria: MatchCriteria;
  fetchOptions?: Options<TSlug, TSelect>;
};

/**
 * Service for matching donations to requests and managing their lifecycle.
 */
export class MatchingService {
  /**
   * Creates a new MatchingService instance.
   * @param apiClient - The API client used for backend communication
   */
  constructor(private apiClient: IApiClient) {}

  async findMatchingDonations<
    TSelect extends SelectFromCollectionSlug<'donations'> = SelectFromCollectionSlug<'donations'>,
  >(
    requestId: string,
    options?: FindMatchOptions<'donations', TSelect>
  ): Promise<FindManyResult<'donations', TSelect, true>> {
    const { criteria, fetchOptions = {} } = options || {};

    if (fetchOptions.pagination === undefined) {
      fetchOptions.pagination = true; // default to paginated results for matches
    }

    const endpoint = `/requests/${requestId}/matched-donations`;
    return this.apiClient.apiFetch(endpoint, {
      method: 'GET',
      searchParams: { criteria, ...fetchOptions },
    });
  }

  async findMatchingRequests<
    TSelect extends SelectFromCollectionSlug<'requests'> = SelectFromCollectionSlug<'requests'>,
  >(
    donationId: string,
    options?: FindMatchOptions<'requests', TSelect>
  ): Promise<FindManyResult<'requests', TSelect, true>> {
    const { criteria, fetchOptions = {} } = options || {};

    if (fetchOptions.pagination === undefined) {
      fetchOptions.pagination = true; // default to paginated results for matches
    }

    const endpoint = `/donations/${donationId}/matched-requests`;
    return this.apiClient.apiFetch(endpoint, {
      method: 'GET',
      searchParams: { criteria, ...fetchOptions },
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
    const options: NearDonationOrRequestOptions = { location, status, maxDistance };

    const paginationOpts = {
      pagination: true,
      page: paginationOptions?.page || 1,
      limit: paginationOptions?.limit || 10,
    };

    return this.apiClient.apiFetch('/donations/near', {
      method: 'GET',
      searchParams: { options, ...paginationOpts },
    });
  }

  async getNearestRequests(
    location: Point,
    status: DonationRequestStatus = 'AVAILABLE',
    maxDistance?: number,
    paginationOptions?: { page?: number; limit?: number }
  ): Promise<FindManyResult<'requests', SelectFromCollectionSlug<'requests'>, true>> {
    const options: NearDonationOrRequestOptions = { location, status, maxDistance };

    const paginationOpts = {
      pagination: true,
      page: paginationOptions?.page || 1,
      limit: paginationOptions?.limit || 10,
    };

    return this.apiClient.apiFetch('/requests/near', {
      method: 'GET',
      searchParams: { options, ...paginationOpts },
    });
  }
}
