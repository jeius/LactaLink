import { AnimatedPressable } from '@/components/animated/pressable';
import { VerticalInfiniteList } from '@/components/lists/VerticalInfiniteList';
import { Skeleton } from '@/components/ui/skeleton';
import RequestCard from '@/features/donation&request/components/cards/RequestCard';
import { useInfiniteIncomingRequests } from '@/features/donation&request/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Request } from '@lactalink/types/payload-generated-types';
import { ListRenderItem } from '@shopify/flash-list';
import { Link } from 'expo-router';
import React, { useCallback } from 'react';

export default function IncomingRequestsScreen() {
  const { data: user } = useMeUser();

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
    isPlaceholderData,
  } = useInfiniteIncomingRequests(user);

  const renderItem = useCallback<ListRenderItem<Request>>(
    ({ item }) => {
      if (isPlaceholderData) return <Skeleton className="h-32 rounded-xl" />;
      return (
        <Link asChild push href={`/requests/${item.id}`}>
          <AnimatedPressable className="overflow-hidden rounded-2xl">
            <RequestCard data={item} orientation="horizontal" />
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
