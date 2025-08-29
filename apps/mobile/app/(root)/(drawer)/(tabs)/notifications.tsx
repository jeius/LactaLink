import React from 'react';

import NotificationListCard from '@/components/cards/NotificationListCard';
import { useScroll } from '@/components/contexts/ScrollProvider';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { NoData } from '@/components/NoData';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchNotifications, useNotificationStore } from '@/lib/stores/notificationStore';
import { Notification } from '@lactalink/types';
import { FlashList, ListRenderItem } from '@shopify/flash-list';

export default function NotificationsTab() {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useScroll();

  const markAsRead = useNotificationStore((s) => s.markAsRead);

  const meUser = useMeUser();

  const { data, isLoading, ...query } = useFetchNotifications();

  const renderItem: ListRenderItem<Notification> = ({ item }) => {
    const isLoading = item.id.includes('placeholder');
    return <NotificationListCard data={item} isLoading={isLoading} onMarkedAsRead={markAsRead} />;
  };

  function EmptyComponent() {
    return !isLoading && <NoData title={`No new notifications found`} />;
  }

  function SeparatorComponent() {
    return <Box style={{ height: 12 }} />;
  }

  function ListHeaderComponent() {
    return (
      <Text size="lg" className="font-JakartaMedium">
        Notifications
      </Text>
    );
  }

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <FlashList
        data={data}
        renderItem={renderItem}
        ListEmptyComponent={EmptyComponent}
        ItemSeparatorComponent={SeparatorComponent}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} />
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
