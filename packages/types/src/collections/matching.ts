import { PREFERRED_STORAGE_TYPES, STORAGE_TYPES } from '@lactalink/enums';
import { Donation, MilkBag, Request, Transaction } from '@lactalink/types';

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
  milkBagIds?: string[];
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
export interface MatchOptions {
  /**
   * IDs of specific milk bags to match
   */
  milkBagIds?: string[];

  /**
   * Preferred delivery mode
   */
  deliveryMode?: string;

  /**
   * ID of a delivery preference to use
   */
  deliveryPreferenceId?: string;
}
