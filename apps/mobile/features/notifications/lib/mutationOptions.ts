import { QUERY_KEYS } from '@/lib/constants';
import { mutationOptions } from '@tanstack/react-query';
import { produce } from 'immer';
import { markRead, markSeen } from './api/update';
import { createMyNotificationsInfQueryOptions } from './queryOptions';

export function createMarkAsSeenMutationOptions() {
  const infQueryKey = createMyNotificationsInfQueryOptions().queryKey;
  return mutationOptions({
    mutationKey: ['notifications', 'markAsSeen'],
    mutationFn: (id: string | string[]) => markSeen(id),
    onMutate: async (inputData, { client }) => {
      await client.cancelQueries({ queryKey: infQueryKey });
      const previousData = client.getQueryData(infQueryKey);

      client.setQueryData(infQueryKey, (oldData) => {
        if (!oldData) return oldData;
        return produce(oldData, (draft) => {
          const ids = Array.isArray(inputData) ? inputData : [inputData];
          if (!ids.length) return;

          for (const id of ids) {
            for (const page of draft.pages) {
              const doc = page.docs.get(id);
              if (doc) {
                doc.seen = true;
                doc.seenAt = new Date().toISOString();
                page.docs = new Map(page.docs).set(id, doc); // Trigger reactivity
              }
            }
          }
        });
      });

      return { previousData };
    },
    onError: (err, _vars, ctx, { client }) => {
      console.error('Failed to mark notification as seen:', err);
      if (!ctx) return;
      client.setQueryData(infQueryKey, ctx.previousData);
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });
}

export function createMarkAsReadMutationOptions() {
  const queryKey = createMyNotificationsInfQueryOptions().queryKey;
  return mutationOptions({
    mutationKey: ['notifications', 'markAsRead'],
    mutationFn: (id: string | string[]) => markRead(id),
    onMutate: async (inputData, { client }) => {
      await client.cancelQueries({ queryKey });
      const previousData = client.getQueryData(queryKey);

      client.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return produce(oldData, (draft) => {
          const ids = Array.isArray(inputData) ? inputData : [inputData];
          if (!ids.length) return;
          for (const id of ids) {
            for (const page of draft.pages) {
              const doc = page.docs.get(id);
              if (doc) {
                doc.read = true;
                doc.readAt = new Date().toISOString();
                page.docs = new Map(page.docs).set(id, doc); // Trigger reactivity
              }
            }
          }
        });
      });

      return { previousData };
    },
    onError: (err, _vars, ctx, { client }) => {
      console.error('Failed to mark notification as read:', err);
      if (!ctx) return;
      client.setQueryData(queryKey, ctx.previousData);
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });
}
