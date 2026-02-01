import { QUERY_KEYS } from '@/lib/constants';
import { getReadTrackingService } from '@/lib/services';
import { getMeUser } from '@/lib/stores/meUserStore';
import { createTempID } from '@/lib/utils/tempID';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { mutationOptions } from '@tanstack/react-query';
import { produce } from 'immer';
import { addDonationToAllCaches, addRequestToAllCaches, addRequestToCache } from '../cacheUtils';

export function createDonationReadMutation() {
  return mutationOptions({
    meta: { errorMessage: () => 'Failed to mark donation as read.' },
    mutationFn: (doc: Donation) => getReadTrackingService().markDonationAsRead(doc),
    onMutate: async (doc, { client }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      client.cancelQueries({ queryKey: QUERY_KEYS.DONATIONS.ALL });

      const optimisticDoc = produce(doc, (draft) => {
        const readDocs = draft.reads?.docs || [];

        readDocs.push({
          id: createTempID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          donation: doc,
          user: getMeUser()!, // Safe to assert meUser exists here
        });

        draft.reads = {
          ...draft.reads,
          docs: readDocs,
          totalDocs: readDocs.length,
        };
      });

      // Optimistically update the donation in the cache
      addDonationToAllCaches(client, optimisticDoc);
    },
    onError: (_err, doc, _ctx, { client }) => {
      // Rollback the optimistic update
      addDonationToAllCaches(client, doc);
    },
    onSuccess: (data, _, __, { client }) => {
      // Update the cache with the actual data from the server
      if (data) addDonationToAllCaches(client, data);
    },
  });
}

export function createRequestReadMutation() {
  return mutationOptions({
    meta: { errorMessage: () => 'Failed to mark request as read.' },
    mutationFn: (doc: Request) => getReadTrackingService().markRequestAsRead(doc),
    onMutate: async (doc, { client }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      client.cancelQueries({ queryKey: QUERY_KEYS.REQUESTS.ALL });

      const optimisticDoc = produce(doc, (draft) => {
        const readDocs = draft.reads?.docs || [];

        readDocs.push({
          id: createTempID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          request: doc,
          user: getMeUser()!, // Safe to assert meUser exists here
        });

        draft.reads = {
          ...draft.reads,
          docs: readDocs,
          totalDocs: readDocs.length,
        };
      });

      // Optimistically update the donation in the cache
      addRequestToAllCaches(client, optimisticDoc);
    },
    onError: (_err, doc, _ctx, { client }) => {
      // Rollback the optimistic update
      addRequestToAllCaches(client, doc);
    },
    onSuccess: (data, _, __, { client }) => {
      // Update the cache with the actual data from the server
      if (data) addRequestToCache(client, data);
    },
  });
}
