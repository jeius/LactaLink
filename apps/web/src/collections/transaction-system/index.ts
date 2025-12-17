import { CollectionConfig } from 'payload';
import { DeliveryDetails } from './DeliveryDetails';
import { DeliveryUpdates } from './DeliveryUpdates';
import { TransactionReads } from './TransactionReads';
import { Transactions } from './Transactions';
import { TransactionStatusHistories } from './TransactionStatusHistory';

const TransactionCollections: CollectionConfig[] = [
  Transactions,
  DeliveryDetails,
  DeliveryUpdates,
  TransactionReads,
  TransactionStatusHistories,
];

export default TransactionCollections;
