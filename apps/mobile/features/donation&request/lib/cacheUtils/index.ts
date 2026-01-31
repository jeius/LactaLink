import { Donation, Request } from '@lactalink/types/payload-generated-types';
import type { QueryClient } from '@tanstack/react-query';
import { createDonationQuery } from '../queryOptions/donations';
import { createRequestQuery } from '../queryOptions/request';

export function addDonationToCache(client: QueryClient, doc: Donation) {
  const queryKey = createDonationQuery(doc).queryKey;
  client.setQueryData(queryKey, doc);
}

export function addRequestToCache(client: QueryClient, doc: Request) {
  const queryKey = createRequestQuery(doc).queryKey;
  client.setQueryData(queryKey, doc);
}
