import {
  MatchCriteria,
  NearListingsOptions,
  NearOrganizationsOptions,
} from '@lactalink/form-schemas/validators';
import type { DonationRequestStatus, Point } from '@lactalink/types';
import type { FindManyResult, FindOptions } from '@lactalink/types/api';
import { Collection, CollectionSlug } from '@lactalink/types/collections';
import { PaginatedDocs, SelectFromCollectionSlug } from '@lactalink/types/payload-types';
import type { IApiClient } from '../../interfaces';

type FetchOptions<TSlug extends CollectionSlug> = Pick<
  FindOptions<TSlug>,
  'page' | 'limit' | 'collection'
>;

export type FindMatchOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = {
  criteria: MatchCriteria;
  fetchOptions?: Omit<FindOptions<TSlug, TSelect, true>, 'collection' | 'draft' | 'overrideAccess'>;
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

  /**
   * @deprecated Use {@link getNearestListings} with collection: 'donations' instead.
   */
  async getNearestDonations(
    location: Point,
    status: DonationRequestStatus = 'AVAILABLE',
    maxDistance?: number,
    paginationOptions?: { page?: number; limit?: number }
  ): Promise<FindManyResult<'donations', SelectFromCollectionSlug<'donations'>, true>> {
    const options: NearListingsOptions = { location, status, maxDistance };

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

  /**
   * @deprecated Use {@link getNearestListings} with collection: 'requests' instead.
   */
  async getNearestRequests(
    location: Point,
    status: DonationRequestStatus = 'AVAILABLE',
    maxDistance?: number,
    paginationOptions?: { page?: number; limit?: number }
  ): Promise<FindManyResult<'requests', SelectFromCollectionSlug<'requests'>, true>> {
    const options: NearListingsOptions = { location, status, maxDistance };

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

  /**
   * Fetches nearest donations or requests based on the provided options.
   * @param options - Options for fetching nearest listings, including collection type, location, and pagination
   * @param init - Optional fetch initialization parameters, such as signal for aborting the request
   * @returns A promise that resolves to a paginated list of the nearest donations or requests
   */
  async getNearestListings<TSlug extends Extract<CollectionSlug, 'donations' | 'requests'>>(
    { collection, page = 1, limit = 10, ...nearOptions }: NearListingsOptions & FetchOptions<TSlug>,
    init?: { signal?: AbortSignal }
  ): Promise<PaginatedDocs<Collection<TSlug>>> {
    return this.apiClient.apiFetch(`/${collection}/near`, {
      ...init,
      method: 'GET',
      searchParams: { options: nearOptions, page, limit },
    });
  }

  /**
   * Fetches nearest hospitals or milk banks based on the provided options.
   * @param options - Options for fetching nearest organizations, including collection type, location, and pagination
   * @param init - Optional fetch initialization parameters, such as signal for aborting the request
   * @returns A promise that resolves to a paginated list of the nearest hospitals or milk banks
   */
  async getNearestOrganizations<TSlug extends Extract<CollectionSlug, 'hospitals' | 'milkBanks'>>(
    {
      collection,
      page = 1,
      limit = 10,
      ...nearOptions
    }: NearOrganizationsOptions & FetchOptions<TSlug>,
    init?: { signal?: AbortSignal }
  ): Promise<PaginatedDocs<Collection<TSlug>>> {
    return this.apiClient.apiFetch(`/${collection}/near`, {
      ...init,
      method: 'GET',
      searchParams: { options: nearOptions, page, limit },
    });
  }
}
