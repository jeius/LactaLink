import { Delivery } from '@lactalink/types';

/**
 * Types of transactions in the system.
 */
export enum TransactionType {
  /** Peer to Peer: direct transactions between individuals */
  P2P = 'P2P',
  /** Peer to Organization: donations from individuals to organizations */
  P2O = 'P2O',
  /** Organization to Peer: distributions from organizations to individuals */
  O2P = 'O2P',
}

/**
 * Transaction status values.
 */
export enum TransactionStatus {
  MATCHED = 'MATCHED',
  PENDING_DELIVERY_CONFIRMATION = 'PENDING_DELIVERY_CONFIRMATION',
  DELIVERY_SCHEDULED = 'DELIVERY_SCHEDULED',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Parameters for updating delivery details.
 */
export interface DeliveryDetailsParams extends NonNullable<Delivery['confirmedDelivery']> {
  proposedBy: string;
  instructions?: string;
}

/**
 * Delivery modes available in the system.
 */
export enum DeliveryMode {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  MEETUP = 'MEETUP',
}

/**
 * Parameters for creating a P2P transaction.
 */
export interface CreateP2PTransactionParams {
  donationID: string;
  requestID: string;
  milkBagIDs: string[];
  delivery?: NonNullable<Delivery['proposedDelivery']>[number];
  instructions?: string;
}

/**
 * Parameters for creating a P2O transaction.
 */
export interface CreateP2OTransactionParams {
  donationID: string;
  organization: { relationTo: 'hospitals' | 'milkBanks'; value: string };
  addressID: string;
  milkBagIDs: string[];
}

/**
 * Parameters for creating an O2P transaction.
 */
export interface CreateO2PTransactionParams {
  requestID: string;
  organization: { relationTo: 'hospitals' | 'milkBanks'; value: string };
  addressID: string;
  milkBagIDs: string[];
}

/**
 * Types of parties in a transaction.
 */
export type PartyType = 'SENDER' | 'RECIPIENT';

/**
 * Parameters for proposing a delivery option with agreement.
 */
export interface DeliveryAgreementParams {
  /**
   * Delivery mode (PICKUP, DELIVERY, MEETUP)
   */
  mode: DeliveryMode;

  /**
   * Address ID for the delivery
   */
  address: string;

  /**
   * Date and time for the delivery
   */
  datetime?: string;

  /**
   * ID of the user proposing the delivery
   */
  userID: string;

  /**
   * Which party is making the proposal
   */
  partyType: PartyType;
}
