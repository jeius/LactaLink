import React, { FC } from 'react';

import NotificationListCard from '@/components/cards/NotificationListCard';
import { useScroll } from '@/components/contexts/ScrollProvider';
import { InfiniteList, InfiniteListItemProps } from '@/components/lists/InfiniteList';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import SafeArea from '@/components/SafeArea';
import { Text } from '@/components/ui/text';
import { useMeUser } from '@/hooks/auth/useAuth';
import { User, Where } from '@lactalink/types';

export default function NotificationsTab() {
  const meUser = useMeUser();
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useScroll();

  const where = createQueryFilter(meUser.data);

  const Item: FC<InfiniteListItemProps<'notifications'>> = ({ item, isLoading }) => {
    return <NotificationListCard data={item} isLoading={isLoading} />;
  };

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <InfiniteList
        slug="notifications"
        ItemComponent={Item}
        isFetching={meUser.isRefetching}
        fetchOptions={{ where, sort: '-createdAt' }}
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
