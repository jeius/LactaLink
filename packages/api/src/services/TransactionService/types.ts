import { Delivery, ProposedDelivery } from '@lactalink/types';

/**
 * Parameters for updating delivery details.
 */
export interface DeliveryDetailsParams
  extends Omit<
    NonNullable<ProposedDelivery>[number],
    'address' | 'agreements' | 'proposedAt' | 'id'
  > {
  /**
   * Address ID for the delivery
   */
  address: string;
}

/**
 * Parameters for creating a P2P transaction.
 */
export interface CreateP2PTransactionParams {
  donationID: string;
  requestID: string;
  milkBagIDs: string[];
  delivery?: NonNullable<Delivery['confirmedDelivery']>;
  proposedDelivery?: NonNullable<Delivery['proposedDelivery']>[number];
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
