import { PREFERRED_STORAGE_TYPES, STORAGE_TYPES } from '@lactalink/enums';

import { FindManyResult, FindOptions } from '../api';

import { Point } from '../geo-types';
import {
  Address,
  CollectionSlug,
  Delivery,
  Donation,
  MilkBag,
  Request,
  SelectFromCollectionSlug,
  Transaction,
  User,
} from '../payload-types';
import { DonationRequestStatus, MatchCriteria } from '../views';

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

/**
 * Result of a matching operation.
 */
export interface MatchResult {
  /**
   * The created transaction
   */
  transaction: Transaction;

  /**
   * Updated donation
   */
  donation: Donation;

  /**
   * Updated request
   */
  request: Request;

  /**
   * Milk bags that were matched
   */
  matchedBags: MilkBag[];

  /**
   * Whether the request was fully fulfilled
   */
  fullyFulfilled: boolean;
}

/**
 * Options for creating a P2O match.
 */
export interface P2OMatchOptions {
  /**
   * IDs of specific milk bags to match
   */
  milkBagIDs?: string[];
  address: string | Address;
}

/**
 * Result of a P2O match operation.
 */
export interface P2OMatchResult {
  /**
   * The created transaction
   */
  transaction: Transaction;

  /**
   * Updated donation
   */
  donation: Donation;
}

/**
 * Options for creating an O2P match.
 */
export interface O2PMatchOptions {
  /**
   * IDs of milk bags to match (required for O2P matches)
   */
  milkBagIds: string[];

  address: string | Address;
}

/**
 * Result of an O2P match operation.
 */
export interface O2PMatchResult {
  /**
   * The created transaction
   */
  transaction: Transaction;

  /**
   * Updated request
   */
  request: Request;
}

/**
 * Options for creating a P2P match.
 */
export interface CreateMatchOptions {
  /**
   * IDs of specific milk bags to match
   */
  milkBagIDs?: string[];

  /**
   * Preferred delivery mode
   */
  delivery: NonNullable<Delivery['confirmedDelivery']>;

  /**
   * Proposed delivery details
   */
  proposedDelivery?: NonNullable<Delivery['proposedDelivery']>[number];

  /**
   * Instructions for the match
   */
  instructions?: string;
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
   * Creates a match between a donation and request, with optional milk bag selection.
   * @param donationID - ID of the donation
   * @param requestID - ID of the request
   * @param options - Optional parameters like specific milk bags to match
   * @returns Match result including transaction and updated donation/request
   */
  createMatch(
    donationID: string,
    requestID: string,
    options: CreateMatchOptions
  ): Promise<Transaction>;

  /**
   * Creates a P2O match (donation to organization).
   * @param donationId - ID of the donation
   * @param organization - Organization details (ID and type)
   * @param options - Optional parameters like specific milk bags to match
   * @returns Match result including transaction
   */
  createP2OMatch(
    donationId: string,
    organization: Exclude<NonNullable<User['profile']>, { relationTo: 'individuals' }>,
    options: P2OMatchOptions
  ): Promise<Transaction>;

  /**
   * Creates an O2P match (organization to request).
   * @param requestId - ID of the request
   * @param organization - Organization details (ID and type)
   * @param options - Optional parameters like specific milk bags to match
   * @returns Match result including transaction and updated request
   */
  createO2PMatch(
    requestId: string,
    organization: Exclude<NonNullable<User['profile']>, { relationTo: 'individuals' }>,
    options: O2PMatchOptions
  ): Promise<Transaction>;

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
