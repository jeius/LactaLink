import { getApiClient } from '@lactalink/api';
import { Notification } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { useMarkSeenMutation } from '../collections/useMarkSeenMutation';
import { depth, ListData } from './utils';

export function useMutateNotifications(queryKey: unknown[]) {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: markRead,
    onMutate: async (inputData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<ListData>(queryKey);

      if (previousData) {
        const updatedData = applyOptimisticUpdate(previousData, inputData);
        queryClient.setQueryData(queryKey, updatedData);
      }

      return { previousData };
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData<ListData>(queryKey, (oldData) =>
        oldData ? applyServerUpdate(oldData, updatedData) : oldData
      );
    },
    onError: (err, _vars, ctx) => {
      const message = extractErrorMessage(err);
      toast.error(`Failed to mark notification as read: ${message}`);
      queryClient.setQueryData(queryKey, ctx?.previousData);
    },
  });

  const markAsSeenMutation = useMarkSeenMutation('notifications', queryKey);

  return { markAsReadMutation, markAsSeenMutation };
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

// Helper function for optimistic updates
function applyOptimisticUpdate(oldData: ListData, inputData: string | Notification): ListData {
  const newPages = oldData.pages.map((page) => ({
    ...page,
    docs: page.docs.map((item) =>
      item.id === extractID(inputData)
        ? { ...item, read: true, readAt: new Date().toISOString() }
        : item
    ),
  }));

  return { ...oldData, pages: newPages };
}

// Helper function for server updates
function applyServerUpdate(oldData: ListData, updatedData: Notification): ListData {
  const newPages = oldData.pages.map((page) => ({
    ...page,
    docs: page.docs.map((item) => (item.id === extractID(updatedData) ? updatedData : item)),
  }));

  return { ...oldData, pages: newPages };
}
//#endregion
