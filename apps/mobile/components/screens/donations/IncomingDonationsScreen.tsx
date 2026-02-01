import { AnimatedPressable } from '@/components/animated/pressable';
import { VerticalInfiniteList } from '@/components/lists/VerticalInfiniteList';
import { Box } from '@/components/ui/box';
import { Skeleton } from '@/components/ui/skeleton';
import DonationCard from '@/features/donation&request/components/cards/DonationCard';
import { useInfiniteIncomingDonations } from '@/features/donation&request/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Donation } from '@lactalink/types/payload-generated-types';
import { ListRenderItem } from '@shopify/flash-list';
import { Link } from 'expo-router';
import React, { useCallback } from 'react';

export default function IncomingDonationsScreen() {
  const { data: user } = useMeUser();

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
    isPlaceholderData,
  } = useInfiniteIncomingDonations(user);

  const renderItem = useCallback<ListRenderItem<Donation>>(
    ({ item }) => {
      if (isPlaceholderData) return <Skeleton className="h-32 rounded-xl" />;
      const isUnread = (item.reads?.docs?.length || 0) === 0;
      return (
        <Link asChild push href={`/requests/${item.id}`}>
          <AnimatedPressable className="overflow-hidden rounded-2xl">
            <DonationCard data={item} orientation="horizontal" />
            {isUnread && (
              <Box
                className="absolute h-2 w-2 rounded-full bg-primary-500"
                style={{ top: 14, right: 14 }}
              />
            )}
          </AnimatedPressable>
        </Link>
      );
    },
    [isPlaceholderData]
  );

  return (
    <VerticalInfiniteList
      data={data}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      refreshing={isRefetching}
      onRefresh={refetch}
      renderItem={renderItem}
      contentContainerClassName="p-4"
      contentInsetAdjustmentBehavior="always"
    />
  );
}
