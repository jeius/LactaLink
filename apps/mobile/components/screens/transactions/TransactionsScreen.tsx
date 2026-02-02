import { VerticalInfiniteList } from '@/components/lists/VerticalInfiniteList';
import { Skeleton } from '@/components/ui/skeleton';
import TransactionListItem from '@/features/transactions/components/TransactionListItem';
import { useInfiniteTransactions } from '@/features/transactions/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { Link } from 'expo-router';
import React from 'react';

export default function TransactionsScreen() {
  const { data, ...query } = useInfiniteTransactions();
  const { data: meUser = null } = useMeUser();

  return (
    <VerticalInfiniteList
      {...query}
      data={data}
      gap={14}
      emptyListLabel="You have no transactions yet."
      contentContainerClassName="p-4"
      refreshing={query.isRefetching}
      onRefresh={query.refetch}
      renderItem={({ item }) => {
        if (isPlaceHolderData(item))
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
