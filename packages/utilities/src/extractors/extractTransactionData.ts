import { TRANSACTION_STATUS, TRANSACTION_TYPE } from '@lactalink/enums';
import { TransactionStatus, UserProfile } from '@lactalink/types';
import {
  DeliveryDetail,
  Donation,
  MilkBag,
  Request,
  Transaction,
} from '@lactalink/types/payload-generated-types';
import { extractCollection } from './extractCollection';

type Item<T> = { value: T; label: string };

type ExtractedTransactionData = {
  sender: UserProfile;
  recipient: UserProfile;
  volume: number;
  donation: Donation | null;
  request: Request | null;
  milkBags: MilkBag[];
  status: Item<TransactionStatus>;
  type: Item<Transaction['type']>;
};

export function extractTransactionData<T extends Transaction | undefined | null>(
  transaction: T
): T extends Transaction ? ExtractedTransactionData : T {
  if (!transaction) return transaction as T extends Transaction ? ExtractedTransactionData : T;

  return {
    sender: transaction.sender,
    recipient: transaction.recipient,
    volume: transaction.volume,
    milkBags: extractCollection(transaction.milkBags),
    donation: extractCollection(transaction.donation),
    request: extractCollection(transaction.request),
    status: TRANSACTION_STATUS[transaction.status],
    type: TRANSACTION_TYPE[transaction.type],
  } as T extends Transaction ? ExtractedTransactionData : T;
}

export function getLatestDeliveryProposal(transaction: Transaction): DeliveryDetail | null {
  const deliveryProposals = transaction.deliveryPlans?.docs;
  if (!deliveryProposals || deliveryProposals.length === 0) return null;
  const dpDoc = extractCollection(deliveryProposals[0]!);

  if (!dpDoc) {
    throw new Error('Delivery proposal not populated.');
  }

  return dpDoc;
}
