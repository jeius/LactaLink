import React, { useCallback } from 'react';

import NotificationListCard from '@/components/cards/NotificationListCard';
import { useScroll } from '@/components/contexts/ScrollProvider';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { NoData } from '@/components/NoData';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useLiveNotifications } from '@/hooks/live-updates/useLiveNotifications';
import { useNotification } from '@/hooks/notifications';
import { useHomeTabsBadgeStore } from '@/lib/stores/homeTabBadgeStore';
import { Notification } from '@lactalink/types';
import { isPlaceHolderData } from '@lactalink/utilities';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useFocusEffect } from 'expo-router';

export default function NotificationsTab() {
  useLiveNotifications();

  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useScroll();

  const meUser = useMeUser();

  const { markAsRead, notifications: data, queryMethods: query } = useNotification();

  const { newDataIDs } = useHomeTabsBadgeStore((s) => s.notifications);

  const renderItem: ListRenderItem<Notification> = ({ item }) => {
    const isLoading = isPlaceHolderData(item);
    const isNew = newDataIDs?.includes(item.id);
    return (
      <NotificationListCard
        data={item}
        showBadge={isNew}
        isLoading={isLoading}
        onMarkedAsRead={markAsRead}
      />
    );
  };

  // Clear notifications badge when screen is unfocused
  useFocusEffect(
    useCallback(() => {
      const { resetNotifications } = useHomeTabsBadgeStore.getState();
      return resetNotifications;
    }, [])
  );

  function EmptyComponent() {
    return !query.isLoading && <NoData title={`No new notifications found`} />;
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

  function handleFetchNextPage() {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
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
        ListFooterComponent={query.isFetchingNextPage ? <Spinner size="small" /> : null}
        ListFooterComponentStyle={{ marginTop: 8 }}
        onEndReachedThreshold={0.25}
        onEndReached={handleFetchNextPage}
      />
      <FetchingSpinner isFetching={meUser.isLoading} />
    </SafeArea>
  );
}
