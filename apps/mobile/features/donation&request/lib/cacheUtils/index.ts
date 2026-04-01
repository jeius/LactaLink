import { getMeUser } from '@/lib/stores/meUserStore';
import { InfiniteDataMap } from '@/lib/types';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import type { QueryClient } from '@tanstack/react-query';
import { Draft, produce } from 'immer';
import { createIncomingDonationsInfQuery } from '../queryOptions/donations';
import { createIncomingRequestsInfQuery } from '../queryOptions/request';
import { addDonationToCache } from './donations';
import { addRequestToCache } from './requests';

export * from './donations';
export * from './requests';

export function addDonationToIncomingInfCache(client: QueryClient, doc: Donation) {
  const queryKey = createIncomingDonationsInfQuery(getMeUser()).queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return updateInfCache(oldData, doc);
  });
}

export function addRequestToIncomingInfCache(client: QueryClient, doc: Request) {
  const queryKey = createIncomingRequestsInfQuery(getMeUser()).queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return updateInfCache(oldData, doc);
  });
}

export function addDonationToAllCaches(client: QueryClient, doc: Donation) {
  addDonationToCache(client, doc);
  addDonationToIncomingInfCache(client, doc);
}

export function addRequestToAllCaches(client: QueryClient, doc: Request) {
  addRequestToCache(client, doc);
  addRequestToIncomingInfCache(client, doc);
}

function updateInfCache<T extends Donation | Request>(oldData: InfiniteDataMap<T>, doc: T) {
  return produce(oldData, (draft) => {
    const isPending = doc.status === 'PENDING';

    for (const page of draft.pages) {
      const newDocs = new Map(page.docs);

      if (page.docs.has(doc.id)) {
        // If still pending, update in place
        if (isPending) newDocs.set(doc.id, doc as Draft<T>);
        // If not pending anymore, remove from incoming inf cache
        else newDocs.delete(doc.id);
      } else {
        // If not present and is pending, add to cache, else do nothing
        if (isPending) newDocs.set(doc.id, doc as Draft<T>);
      }
      // Update the page docs
      page.docs = newDocs;
    }
  });
}
