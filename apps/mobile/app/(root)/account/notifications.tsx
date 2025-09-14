import React, { useCallback } from 'react';

import NotificationListCard from '@/components/cards/NotificationListCard';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { NoData } from '@/components/NoData';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useNotification } from '@/hooks/notifications';
import { Notification } from '@lactalink/types/payload-generated-types';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useFocusEffect } from 'expo-router';

export default function AccountNotifications() {
  const meUser = useMeUser();

  const { markAsRead, notifications: data, queryMethods: query, markAsSeen } = useNotification();

  const renderItem: ListRenderItem<Notification> = ({ item }) => {
    const isLoading = isPlaceHolderData(item);
    return (
      <NotificationListCard
        data={item}
        showBadge
        isLoading={isLoading}
        onMarkedAsRead={markAsRead}
      />
    );
  };

  // Clear notifications badge when screen is unfocused
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => markAsSeen, []));

  function EmptyComponent() {
    return !query.isLoading && <NoData title="You have no notifications" />;
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
        contentContainerStyle={{ padding: 16, paddingBottom: 80, flexGrow: 1 }}
        ListFooterComponent={query.isFetchingNextPage ? <Spinner size="small" /> : null}
        ListFooterComponentStyle={{ marginTop: 8 }}
        onEndReachedThreshold={0.25}
        onEndReached={handleFetchNextPage}
      />
      <FetchingSpinner isFetching={meUser.isLoading} />
    </SafeArea>
  );
}
