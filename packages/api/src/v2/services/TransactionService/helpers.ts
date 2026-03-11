import { MilkBag, Transaction, User } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { IApiClient } from '../../interfaces';

export function fetchDonation(client: IApiClient, id: string) {
  return client.findByID({
    collection: 'donations',
    id: id,
    depth: 0,
  });
}

export function fetchRequest(client: IApiClient, id: string) {
  return client.findByID({
    collection: 'requests',
    id: id,
    depth: 0,
  });
}

export function fetchMilkBags(client: IApiClient, ids: string[]) {
  return client.find({
    collection: 'milkBags',
    where: { id: { in: ids } },
    depth: 0,
    pagination: false,
  });
}

export async function getVolume(client: IApiClient, bags: (string | MilkBag)[]) {
  const milkBags = extractCollection(bags) || (await fetchMilkBags(client, extractID(bags)));
  return milkBags.reduce((total, bag) => total + (bag.volume || 0), 0);
}

export function getUserDeliveryUpdate(transaction: Transaction, user: string | User) {
  const totalDocs = transaction.deliveryUpdates?.docs?.length || 0;
  const deliveryUpdates = extractCollection(transaction.deliveryUpdates?.docs);
  if (!deliveryUpdates || totalDocs === 0) return null;

  if (deliveryUpdates.length === 0) {
    throw new Error('Delivery updates of this transaction are not populated.');
  }

  return deliveryUpdates.find((update) => extractID(update.user) === extractID(user)) ?? null;
}

export function getDeliveryDetail(transaction: Transaction) {
  const deliveryDetail = extractCollection(transaction.deliveryDetails?.docs?.[0]);
  if (!deliveryDetail) {
    throw new Error('Delivery details of this transaction are not populated or does not exist.');
  }
  return deliveryDetail;
}
