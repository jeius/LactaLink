import { addTransactionToAllCache } from '@/features/transactions/lib/cacheUtils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { RequestCreateSchema } from '@lactalink/form-schemas';
import { Request } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { mutationOptions } from '@tanstack/react-query';
import { createRequest } from '../api/create';
import { cancelListing } from '../api/update';
import {
  addRequestToAllCaches,
  addRequestToCache,
  addToUserRequestsInfCache,
  removeFromUserRequestsInfCache,
} from '../cacheUtils';

export function createRequestCreateMutation(init?: RequestInit) {
  return mutationOptions({
    mutationFn: (data: RequestCreateSchema) => createRequest(data, init),
    onSuccess: (data, _vars, _ctx, { client }) => {
      if (!data) return; // No data means the mutation was cancelled, so we skip cache updates

      addRequestToAllCaches(client, data.request);

      if (data.transaction) {
        addTransactionToAllCache(client, data.transaction);
      }

      const meUser = getMeUser();
      if (meUser) {
        addToUserRequestsInfCache(client, { doc: data.request, user: meUser });
      }
    },
  });
}

export function createCancelRequestMutation(doc: Request | null | undefined, init?: RequestInit) {
  const requestID = doc && extractID(doc);
  return mutationOptions({
    mutationKey: ['cancel', 'donation', requestID].filter(Boolean),
    mutationFn: async () => {
      if (!requestID) return;
      return cancelListing({ id: requestID, slug: 'requests' }, init);
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      if (data === undefined) return; // Undefined data means the mutation was not initiated

      // Add to global donation cache
      addRequestToCache(client, data);

      const meUser = getMeUser();
      if (!meUser) return;
      addToUserRequestsInfCache(client, { doc: data, user: meUser });
      if (doc) removeFromUserRequestsInfCache(client, { doc: doc, user: meUser });
    },
  });
}
