import { FC, useCallback } from 'react';

import { useHeaderScrollHandler, useHeaderSize } from '@/components/contexts/HeaderProvider';
import { NoData } from '@/components/NoData';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { InfiniteFlashList, InfiniteFlashListProps } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import NotificationCard from '@/features/notifications/components/NotificationCard';
import { useMyNotifications } from '@/features/notifications/hooks/useMyNotifications';
import { useLiveNotifications } from '@/hooks/live-updates/useLiveNotifications';
import { Notification } from '@lactalink/types/payload-generated-types';
import { extractID, listKeyExtractor } from '@lactalink/utilities/extractors';
import { useFocusEffect } from 'expo-router';
import Animated, { AnimatedProps } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedFlashList = Animated.createAnimatedComponent(InfiniteFlashList) as FC<
  AnimatedProps<InfiniteFlashListProps<Notification>>
>;

export default function NotificationsTabScreen() {
  useLiveNotifications();

  const scrollHandler = useHeaderScrollHandler();
  const insets = useSafeAreaInsets();
  const { height: headerHeight } = useHeaderSize();

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
    <SafeArea className="items-stretch">
      <AnimatedFlashList
        {...notifQuery}
        data={notifications}
        bounces={false}
        overScrollMode={'never'}
        onScroll={scrollHandler}
        keyExtractor={listKeyExtractor}
        headerClassName="mb-2"
        footerClassName="mt-2"
        contentContainerClassName="p-4"
        progressViewOffset={headerHeight - insets.top}
        refreshing={notifQuery.isRefetching}
        onRefresh={notifQuery.refetch}
        contentContainerStyle={{
          paddingBottom: 80,
          marginTop: headerHeight - insets.top,
        }}
        ItemSeparatorComponent={() => <Box className="h-3" />}
        ListHeaderComponent={
          <Text size="lg" bold>
            Notifications
          </Text>
        }
        ListEmptyComponent={
          notifQuery.isLoading ? null : <NoData title="You have no notifications" />
        }
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
