import React, { FC } from 'react';

import TransactionListCard from '@/components/cards/TransactionListCard';
import { InfiniteList, InfiniteListItemProps } from '@/components/lists/InfiniteList';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import SafeArea from '@/components/SafeArea';
import { Text } from '@/components/ui/text';
import { useMeUser } from '@/hooks/auth/useAuth';
import { User, Where } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';

export default function HistoryTab() {
  const meUser = useMeUser();
  const meProfile = meUser.data?.profile;

  const where = createQueryFilter(meProfile);

  const Item: FC<InfiniteListItemProps<'transactions'>> = ({ item, isLoading }) => {
    return <TransactionListCard user={meUser.data} data={item} isLoading={isLoading} />;
  };

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <InfiniteList
        slug="transactions"
        ItemComponent={Item}
        isFetching={meUser.isRefetching}
        fetchOptions={{ where }}
        ListHeaderComponent={
          <Text size="lg" className="font-JakartaMedium">
            Transaction History
          </Text>
        }
        ListHeaderComponentStyle={{ marginBottom: 8 }}
        contentContainerStyle={{ padding: 16 }}
      />
      <FetchingSpinner isFetching={meUser.isLoading} />
    </SafeArea>
  );
}

function createQueryFilter(profile: User['profile']): Where | undefined {
  if (!profile) return undefined;
  return {
    or: [
      {
        and: [
          { 'sender.relationTo': { equals: profile.relationTo } },
          { 'sender.value': { equals: extractID(profile.value) } },
        ],
      },
      {
        and: [
          { 'recipient.relationTo': { equals: profile.relationTo } },
          { 'recipient.value': { equals: extractID(profile.value) } },
        ],
      },
    ],
  };
}
