import { markSeen } from '@/lib/api/markSeen';
import { InfiniteDataMap } from '@/lib/types';
import { getApiClient } from '@lactalink/api';
import { Notification } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { toast } from 'sonner-native';

type ListData = InfiniteDataMap<Notification>;

const depth = 3;

export function useNotificationMutations(queryKey: QueryKey) {
  const markAsReadMutation = useMarkReadNotificationMutation(queryKey);
  const markAsSeenMutation = useMarkSeenNotificationMutation(queryKey);
  return { markAsReadMutation, markAsSeenMutation };
}

export function useMarkReadNotificationMutation(queryKey: QueryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markRead,
    onMutate: async (inputData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<ListData>(queryKey);

      queryClient.setQueryData<ListData>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return produce(oldData, (draft) => {
          for (const page of draft.pages) {
            const doc = page.docs.get(extractID(inputData));
            if (doc) {
              doc.read = true;
              doc.readAt = new Date().toISOString();
              page.docs = new Map(page.docs).set(extractID(inputData), doc);
            }
          }
        });
      });

      return { previousData };
    },
    onError: (err, _vars, ctx) => {
      const message = extractErrorMessage(err);
      toast.error(`Failed to mark notification as read: ${message}`);
      queryClient.setQueryData(queryKey, ctx?.previousData);
    },
    onSuccess: (data) => {
      // Optionally update the cache with server response
      queryClient.setQueryData<ListData>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return applyServerUpdate(oldData, data);
      });
    },
  });
}

export function useMarkSeenNotificationMutation(queryKey: QueryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { invalidatesQuery: queryKey },
    mutationFn: (id: string | string[]) => markSeen('notifications', id),
    onMutate: async (inputData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<ListData>(queryKey);

      queryClient.setQueryData<ListData>(queryKey, (oldData) => {
        if (!oldData) return oldData;

        const ids = Array.isArray(inputData) ? inputData : [inputData];
        if (!ids.length) return oldData;

        return produce(oldData, (draft) => {
          for (const page of draft.pages) {
            for (const id of ids) {
              const doc = page.docs.get(id);
              if (doc) {
                doc.seen = true;
                doc.seenAt = new Date().toISOString();
                page.docs = new Map(page.docs).set(id, doc);
              }
            }
          }
        });
      });

      return { previousData };
    },
    onError: (err, vars, ctx) => {
      const message = extractErrorMessage(err);
      console.warn(`Failed to mark notification as seen: ${message}`, { ids: vars });
      if (!ctx) return;
      queryClient.setQueryData(queryKey, ctx.previousData);
    },
  });
}

//#region Helpers

// API call to mark a notification as read
function markRead(notification: string | Notification) {
  const apiClient = getApiClient();
  return apiClient.updateByID({
    collection: 'notifications',
    id: extractID(notification),
    data: { read: true, readAt: new Date().toISOString() },
    depth,
  });
}

// Helper function for server updates
function applyServerUpdate(oldData: ListData, updatedData: Notification): ListData {
  return produce(oldData, (draft) => {
    for (const page of draft.pages) {
      const doc = page.docs.get(extractID(updatedData));
      if (doc) {
        page.docs = new Map(page.docs).set(extractID(updatedData), updatedData);
      }
    }
  });
}
//#endregion
