import { VerticalInfiniteList } from '@/components/ui/list';
import { Skeleton } from '@/components/ui/skeleton';
import TransactionListItem from '@/features/transactions/components/TransactionListItem';
import { useInfiniteDeliveries } from '@/features/transactions/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { Link } from 'expo-router';
import React from 'react';

export default function AccountDeliveriesScreen() {
  const { data, ...query } = useInfiniteDeliveries();
  const { data: meUser = null } = useMeUser();

  return (
    <VerticalInfiniteList
      {...query}
      data={data}
      gap={14}
      emptyListLabel="You have no deliveries yet."
      contentContainerClassName="p-4"
      refreshing={query.isRefetching}
      onRefresh={query.refetch}
      renderItem={({ item, isPlaceholder }) => {
        if (isPlaceHolderData(item) && isPlaceholder)
          return <Skeleton className="rounded-2xl" style={{ height: 112 }} />;
        return (
          <Link href={`/transactions/${item.id}`} asChild push>
            <TransactionListItem data={item} showBadge user={meUser} />
          </Link>
        );
      }}
    />
  );
}
