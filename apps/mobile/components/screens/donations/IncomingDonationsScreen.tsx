import { VerticalInfiniteList } from '@/components/lists/VerticalInfiniteList';
import { Skeleton } from '@/components/ui/skeleton';
import DonationCard from '@/features/donation&request/components/cards/DonationCard';
import { useInfiniteIncomingDonations } from '@/features/donation&request/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Donation } from '@lactalink/types/payload-generated-types';
import { ListRenderItem } from '@shopify/flash-list';
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
      return <DonationCard data={item} />;
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
