import { PREFERRED_STORAGE_TYPES, STORAGE_TYPES } from '@lactalink/enums';
import { MatchCriteria } from '@lactalink/form-schemas/validators';

import type { DonationRequestStatus, Point } from '@lactalink/types';
import type { FindManyResult, FindOptions } from '@lactalink/types/api';
import type { CollectionSlug, SelectFromCollectionSlug } from '@lactalink/types/payload-types';

type Options<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean,
> = Omit<FindOptions<TSlug, TSelect, TPaginate>, 'collection' | 'draft' | 'overrideAccess'>;

/**
 * Matching criteria for finding compatible donations.
 */
export interface DonationMatchCriteria {
  /**
   * Minimum volume needed
   */
  minVolume?: number;

  /**
   * Storage type preference (FRESH, FROZEN, EITHER)
   */
  storageType?: keyof typeof STORAGE_TYPES;

  /**
   * Maximum distance in meters
   */
  maxDistance?: number;

  /**
   * Exclude specific donation IDs
   */
  excludeDonationIds?: string[];

  /**
   * Only include donations from specific donor
   */
  donorId?: string;

  /**
   * Exclude donations from specific donors
   */
  excludeDonorIds?: string[];
}

/**
 * Matching criteria for finding compatible requests.
 */
export interface RequestMatchCriteria {
  /**
   * Maximum volume that can be provided
   */
  maxVolume?: number;

  /**
   * Storage type of the donation (FRESH, FROZEN)
   */
  storageType?: keyof typeof PREFERRED_STORAGE_TYPES;

  /**
   * Maximum distance in meters
   */
  maxDistance?: number;

  /**
   * Exclude specific request IDs
   */
  excludeRequestIds?: string[];

  /**
   * Only include requests from specific requester
   */
  requesterId?: string;

  /**
   * Exclude requests from specific requesters
   */
  excludeRequesterIds?: string[];

  /**
   * Prioritize by urgency level
   */
  prioritizeUrgent?: boolean;
}

export type FindMatchOptions<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  criteria: MatchCriteria;
  fetchOptions?: Options<TSlug, TSelect, true>;
};

/**
 * Interface defining the contract for the MatchingService.
 * Provides methods for matching donations and requests, and creating transactions.
 */
export interface IMatchingService {
  /**
   * Finds compatible donations for a request based on specified criteria.
   * @param requestId - ID of the request to find donations for
   * @param options - Matching criteria and fetch options
   * @returns List of compatible donations
   */
  findMatchingDonations<
    TSelect extends SelectFromCollectionSlug<'donations'> = SelectFromCollectionSlug<'donations'>,
  >(
    requestId: string,
    options?: FindMatchOptions<'donations', TSelect>
  ): Promise<FindManyResult<'donations', TSelect, true>>;

  /**
   * Finds compatible requests for a donation based on specified criteria.
   * @param donationId - ID of the donation to find requests for
   * @param options - Matching criteria and fetch options
   * @returns List of compatible requests
   */
  findMatchingRequests<
    TSelect extends SelectFromCollectionSlug<'requests'> = SelectFromCollectionSlug<'requests'>,
  >(
    donationId: string,
    options?: FindMatchOptions<'requests', TSelect>
  ): Promise<FindManyResult<'requests', TSelect, true>>;

  /**
   * Gets the best matching donations for a request.
   * @param requestId - ID of the request
   * @param maxDistance - Maximum distance for matching
   * @param limit - Maximum number of donations to return
   * @returns List of compatible donations
   */
  getRecommendedDonationsForRequest(
    requestId: string,
    maxDistance?: number,
    limit?: number
  ): Promise<FindManyResult<'donations', SelectFromCollectionSlug<'donations'>>>;

  /**
   * Gets the best matching requests for a donation.
   * @param donationId - ID of the donation
   * @param maxDistance - Maximum distance for matching
   * @param limit - Maximum number of requests to return
   * @returns List of compatible requests
   */
  getRecommendedRequestsForDonation(
    donationId: string,
    maxDistance?: number,
    limit?: number
  ): Promise<FindManyResult<'requests', SelectFromCollectionSlug<'requests'>, true>>;

  /**
   * Gets the nearest donations based on location and status.
   * @param location - Geographical point to search from
   * @param status - Optional status filter for donations
   * @param maxDistance - Maximum distance in meters to search
   * @param paginationOptions - Optional pagination parameters
   * @defaults status = 'AVAILABLE'
   * @defaults maxDistance = 10000
   * @returns List of nearest donations
   */
  getNearestDonations(
    location: Point,
    status?: DonationRequestStatus,
    maxDistance?: number,
    paginationOptions?: { page?: number; limit?: number }
  ): Promise<FindManyResult<'donations', SelectFromCollectionSlug<'donations'>, true>>;

  /**
   * Gets the nearest requests based on location and status.
   * @param location - Geographical point to search from
   * @param status - Optional status filter for requests
   * @param maxDistance - Maximum distance in meters to search
   * @param paginationOptions - Optional pagination parameters
   * @defaults status = 'AVAILABLE'
   * @defaults maxDistance = 10000
   * @returns List of nearest requests
   */
  getNearestRequests(
    location: Point,
    status?: DonationRequestStatus,
    maxDistance?: number,
    paginationOptions?: { page?: number; limit?: number }
  ): Promise<FindManyResult<'requests', SelectFromCollectionSlug<'requests'>, true>>;
}
