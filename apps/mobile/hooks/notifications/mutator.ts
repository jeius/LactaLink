import { getApiClient } from '@lactalink/api';
import { Notification } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { depth, ListData } from './utils';

export function useMutateNotifications(queryKey: unknown[]) {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: markRead,
    onMutate: onMarkRead(queryClient, queryKey),
    onSuccess: (newData, inputData) => {
      queryClient.setQueryData(queryKey, (oldData: ListData | undefined) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page) => {
          const newDocs = page.docs.map((item) => (item.id === inputData.id ? newData : item));
          return { ...page, docs: newDocs };
        });

        return { ...oldData, pages: newPages };
      });
    },
    onError: (err, _vars, ctx) => {
      const message = extractErrorMessage(err);
      toast.error(`Failed to mark notification as read: ${message}`);
      queryClient.setQueryData(queryKey, ctx?.previousData);
    },
  });

  return { markAsReadMutation };
}

function markRead(notification: Notification) {
  const apiClient = getApiClient();
  return apiClient.updateByID({
    collection: 'notifications',
    id: notification.id,
    data: { read: true, readAt: new Date().toISOString() },
    depth,
  });
}

function onMarkRead(queryClient: QueryClient, queryKey: unknown[]) {
  return async (inputData: Notification) => {
    await queryClient.cancelQueries({ queryKey });

    const previousData = queryClient.getQueryData<ListData>(queryKey);

    queryClient.setQueryData<ListData | undefined>(queryKey, (oldData) => {
      if (!oldData) return oldData;

      const newPages = oldData.pages.map((page) => {
        const newDocs = page.docs.map((item) =>
          item.id === inputData.id
            ? { ...item, read: true, readAt: new Date().toISOString() }
            : item
        );
        return { ...page, docs: newDocs };
      });

      return { ...oldData, pages: newPages };
    });

    return { previousData };
  };
}
