import {
  removeItemFromInfiniteDataMap,
  updateInfiniteDataMap,
} from '@/lib/utils/infiniteListUtils';
import { Request, User } from '@lactalink/types/payload-generated-types';
import { type QueryClient } from '@tanstack/react-query';
import { createRequestQuery, createUserRequestsInfQuery } from '../queryOptions/request';

export function addToUserRequestsInfCache(
  client: QueryClient,
  { doc, user }: { doc: Request; user: User }
) {
  const queryKey = createUserRequestsInfQuery(user, doc.status).queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return updateInfiniteDataMap(oldData, doc, 'unshift');
  });
}

export function removeFromUserRequestsInfCache(
  client: QueryClient,
  { doc, user }: { doc: Request; user: User }
) {
  const queryKey = createUserRequestsInfQuery(user, doc.status).queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return removeItemFromInfiniteDataMap(oldData, doc.id);
  });
}

export function addRequestToCache(client: QueryClient, doc: Request) {
  const queryKey = createRequestQuery(doc).queryKey;
  client.setQueryData(queryKey, doc);
}
