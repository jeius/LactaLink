import { useCallback } from 'react';

import { NoData } from '@/components/NoData';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { InfiniteFlashList } from '@/components/ui/list';
import NotificationCard from '@/features/notifications/components/NotificationCard';
import { useMyNotifications } from '@/features/notifications/hooks/useMyNotifications';
import { extractID, listKeyExtractor } from '@lactalink/utilities/extractors';
import { useFocusEffect } from 'expo-router';

export default function AccountNotifications() {
  const { notifications, unSeenNotifications, notifQuery, markReadMutation, markSeenMutation } =
    useMyNotifications();

  const { mutate: markAsSeen } = markSeenMutation;
  const { mutate: markAsRead } = markReadMutation;

  useFocusEffect(
    useCallback(() => {
      // Clear notifications badge when screen is unfocused
      return () => {
        if (unSeenNotifications?.length) {
          markAsSeen(extractID(unSeenNotifications));
        }
      };
    }, [markAsSeen, unSeenNotifications])
  );

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <InfiniteFlashList
        {...notifQuery}
        data={notifications}
        keyExtractor={listKeyExtractor}
        contentContainerClassName="p-4"
        footerClassName="mt-2"
        refreshing={notifQuery.isRefetching}
        onRefresh={notifQuery.refetch}
        ListEmptyComponent={
          notifQuery.isLoading ? null : <NoData title="You have no notifications" />
        }
        ItemSeparatorComponent={() => <Box className="h-3" />}
        renderItem={({ item, isPlaceholder }) => {
          if (isPlaceholder) return <NotificationCard.Skeleton />;
          return (
            <NotificationCard
              data={item}
              showBadge
              onMarkedAsRead={(data) => markAsRead(data.id)}
            />
          );
        }}
      />
    </SafeArea>
  );
}
