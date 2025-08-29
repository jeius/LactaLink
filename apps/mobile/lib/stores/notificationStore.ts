import { useMeUser } from '@/hooks/auth/useAuth';
import { useInfiniteFetchBySlug } from '@/hooks/collections/useInfiniteFetchBySlug';
import { getApiClient } from '@lactalink/api';
import { Notification, PaginatedDocs, User, Where } from '@lactalink/types';
import {
  createStorageKeyByUser,
  extractErrorMessage,
  generatePlaceHolders,
} from '@lactalink/utilities';
import { InfiniteData, QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner-native';
import { create } from 'zustand';
import { MMKV_KEYS } from '../constants';
import { INFINITE_QUERY_KEY } from '../constants/queryKeys';
import localStorage from '../localStorage';

const { LAST_DATA, LAST_FETCH } = MMKV_KEYS.NOTIFICATIONS;

const depth = 3;
const collection = 'notifications';
const placeholder = generatePlaceHolders(15, { id: 'placeholder' } as Notification);
type ListData = InfiniteData<PaginatedDocs<Notification>>;

interface NotificationStoreState {
  notifications: Notification[];
  unReadCount: number | undefined;
  markAsRead?: (notification: Notification) => Promise<Notification>;
  setters: {
    setNotifications: (notifications: Notification[]) => void;
    setUnReadCount: (count: number | undefined) => void;
    setMarkAsRead: (fn: (notification: Notification) => Promise<Notification>) => void;
  };
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  notifications: [],
  unReadCount: 0,
  setters: {
    setNotifications: (notifications: Notification[]) => set({ notifications }),
    setUnReadCount: (count: number | undefined) => set({ unReadCount: count }),
    setMarkAsRead: (fn: (notification: Notification) => Promise<Notification>) =>
      set({ markAsRead: fn }),
  },
}));

export function useFetchNotifications() {
  // Get current user to create query filter and storage keys
  const meUser = useMeUser();
  const where = createQueryFilter(meUser.data);
  const fetchOptions = { where, sort: '-createdAt', depth };

  const queryKey = [...INFINITE_QUERY_KEY, collection, fetchOptions];

  // Load last fetched data from storage as placeholder data
  const lastDataKey = useMemo(() => createStorageKeyByUser(meUser.data, LAST_DATA), [meUser.data]);
  const placeholderData = useMemo(() => {
    const lastFetchedData = localStorage.getString(lastDataKey);
    if (!lastFetchedData) return undefined;
    try {
      return JSON.parse(lastFetchedData) as ListData;
    } catch {
      return undefined;
    }
  }, [lastDataKey]);

  // Infinite query to fetch notifications
  const { data: queryData, ...queryRes } = useInfiniteFetchBySlug(
    true,
    { collection, ...fetchOptions },
    { queryKey, placeholderData }
  );

  // Derive notifications and unReadCount from query data
  const { data: notifications, unReadCount } = useMemo(() => {
    const isLoading = queryRes.isLoading;
    const data = isLoading ? placeholder : queryData?.pages.flatMap((page) => page.docs) || [];
    const unReadCount = isLoading
      ? undefined
      : data.reduce((count, n) => (n.read ? count : count + 1), 0);
    return { data, unReadCount };
  }, [queryRes.isLoading, queryData]);

  // Persist last fetched data to storage
  useEffect(() => {
    localStorage.set(createStorageKeyByUser(meUser.data, LAST_FETCH), new Date().toISOString());
    localStorage.set(lastDataKey, JSON.stringify(queryData));
  }, [lastDataKey, meUser.data, queryData, unReadCount]);

  return { data: notifications, unReadCount, queryKey, ...queryRes };
}

export function useNotificationStoreInitializer() {
  const { queryKey, data: notifications, unReadCount } = useFetchNotifications();

  const queryClient = useQueryClient();
  const setters = useNotificationStore((s) => s.setters);

  const { mutateAsync: markAsRead } = useMutation({
    mutationFn: markRead,
    onMutate: onMutate(queryClient, queryKey),
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

  // Sync zustand store with intitialized notifications
  useEffect(() => {
    setters.setNotifications(notifications);
    setters.setUnReadCount(unReadCount);
    setters.setMarkAsRead(markAsRead);
  }, [notifications, unReadCount, markAsRead, setters]);

  return { notifications, unReadCount };
}

// #region Helpers
function createQueryFilter(user: User | null): Where | undefined {
  if (!user) return undefined;
  return {
    recipient: { equals: user.id },
  };
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

function onMutate(queryClient: QueryClient, queryKey: unknown[]) {
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
// #endregion
