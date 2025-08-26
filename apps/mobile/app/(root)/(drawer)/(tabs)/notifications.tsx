import React, { FC } from 'react';

import NotificationListCard from '@/components/cards/NotificationListCard';
import { useScroll } from '@/components/contexts/ScrollProvider';
import { InfiniteList, InfiniteListItemProps } from '@/components/lists/InfiniteList';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import SafeArea from '@/components/SafeArea';
import { Text } from '@/components/ui/text';
import { useMeUser } from '@/hooks/auth/useAuth';
import { INFINITE_QUERY_KEY } from '@/lib/constants';
import { getApiClient } from '@lactalink/api';
import { Notification, PaginatedDocs, User, Where } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { InfiniteData, QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

const depth = 3;
const collection = 'notifications';

type ListData = InfiniteData<PaginatedDocs<Notification>>;

export default function NotificationsTab() {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useScroll();

  const meUser = useMeUser();
  const where = createQueryFilter(meUser.data);
  const fetchOptions = { where, sort: '-createdAt', depth };

  const queryClient = useQueryClient();
  const queryKey = [...INFINITE_QUERY_KEY, collection, fetchOptions];

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

  const Item: FC<InfiniteListItemProps<'notifications'>> = ({ item, isLoading }) => {
    return <NotificationListCard data={item} isLoading={isLoading} onMarkedAsRead={markAsRead} />;
  };

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <InfiniteList
        slug="notifications"
        ItemComponent={Item}
        isFetching={meUser.isRefetching}
        fetchOptions={fetchOptions}
        ListHeaderComponent={
          <Text size="lg" className="font-JakartaMedium">
            Notifications
          </Text>
        }
        ListHeaderComponentStyle={{ marginBottom: 8 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        onScroll={({ nativeEvent }) => onScroll(nativeEvent)}
        onScrollBeginDrag={({ nativeEvent }) => onScrollBeginDrag(nativeEvent)}
        onScrollEndDrag={({ nativeEvent }) => onScrollEndDrag(nativeEvent)}
      />
      <FetchingSpinner isFetching={meUser.isLoading} />
    </SafeArea>
  );
}

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
