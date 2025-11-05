import { TRANSACTION_STATUS, TRANSACTION_TYPE } from '@lactalink/enums';
import { TransactionStatus } from '@lactalink/types';
import { Collection } from '@lactalink/types/collections';
import {
  ConfirmedDelivery,
  Donation,
  MilkBag,
  ProposedDelivery,
  Request,
  Transaction,
  User,
} from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractCollection } from './extractCollection';

type Item<T> = { value: T; label: string };
type Profile<TSlug extends Extract<CollectionSlug, 'individuals' | 'hospitals' | 'milkBanks'>> = {
  relationTo: TSlug;
  value: Collection<TSlug>;
};

type ExtractedTransactionData = {
  sender: User['profile'];
  recipient: User['profile'];
  volume: number;
  delivery: ConfirmedDelivery | null;
  proposed: NonNullable<ProposedDelivery>[number] | null;
  proposedDeliveries: ProposedDelivery;
  donation: Donation | null;
  request: Request | null;
  milkBags: MilkBag[];
  status: Item<TransactionStatus>;
  type: Item<Transaction['transactionType']>;
};

export function extractTransactionData<T extends Transaction | undefined | null>(
  transaction: T
): T extends Transaction ? ExtractedTransactionData : T {
  if (!transaction) return transaction as T extends Transaction ? ExtractedTransactionData : T;

  return {
    sender: transaction.sender,
    recipient: transaction.recipient,
    volume: transaction.matchedVolume,
    milkBags: extractCollection(transaction.matchedBags),
    donation: extractCollection(transaction.donation),
    request: extractCollection(transaction.request),
    delivery: transaction.delivery?.confirmed || null,
    proposed: getLatestDeliveryProposal(transaction.delivery?.proposed),
    proposedDeliveries: transaction.delivery?.proposed || null,
    status: TRANSACTION_STATUS[transaction.status],
    type: TRANSACTION_TYPE[transaction.transactionType],
  } as T extends Transaction ? ExtractedTransactionData : T;
}

function getLatestDeliveryProposal(
  deliveryProposals: ProposedDelivery | undefined
): NonNullable<ProposedDelivery>[number] | null {
  if (!deliveryProposals || deliveryProposals.length === 0) return null;
  return deliveryProposals.reduce((latest, current) => {
    return new Date(current.proposedAt) > new Date(latest.proposedAt) ? current : latest;
  });
}
