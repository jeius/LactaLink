import { CollectionConfig } from 'payload';
import { DeliveryAgreements } from './DeliveryAgreements';
import { DeliveryDetails } from './DeliveryDetails';
import { TransactionEvents } from './TransactionEvents';
import { Transactions } from './Transactions';

const TransactionCollections: CollectionConfig[] = [
  Transactions,
  TransactionEvents,
  DeliveryAgreements,
  DeliveryDetails,
];

export default TransactionCollections;
