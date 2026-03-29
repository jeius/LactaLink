import {
  removeItemFromInfiniteDataMap,
  updateInfiniteDataMap,
} from '@/lib/utils/infiniteListUtils';
import { Donation, User } from '@lactalink/types/payload-generated-types';
import { type QueryClient } from '@tanstack/react-query';
import { createDonationQuery, createUserDonationsInfQuery } from '../queryOptions/donations';

export function addToUserDonationsInfCache(
  client: QueryClient,
  { doc, user }: { doc: Donation; user: User }
) {
  const queryKey = createUserDonationsInfQuery(user, doc.status).queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return updateInfiniteDataMap(oldData, doc, 'unshift');
  });
}

export function removeFromUserDonationsInfCache(
  client: QueryClient,
  { doc, user }: { doc: Donation; user: User }
) {
  const queryKey = createUserDonationsInfQuery(user, doc.status).queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return removeItemFromInfiniteDataMap(oldData, doc.id);
  });
}

export function addDonationToCache(client: QueryClient, doc: Donation) {
  const queryKey = createDonationQuery(doc).queryKey;
  client.setQueryData(queryKey, doc);
}
