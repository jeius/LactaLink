import { stringify } from 'qs';

import { NearDonationOrRequestOptions } from '@lactalink/form-schemas/validators';
import type { DonationRequestStatus, Point } from '@lactalink/types';
import type { ApiFetchResponse, FindManyResult } from '@lactalink/types/api';
import type { SelectFromCollectionSlug } from '@lactalink/types/payload-types';
import type { FindMatchOptions, IApiClient, IMatchingService } from '../../interfaces';

/**
 * Service for matching donations to requests and managing their lifecycle.
 */
export class MatchingService implements IMatchingService {
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
    const options: NearDonationOrRequestOptions = { location, status, maxDistance };
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
}
