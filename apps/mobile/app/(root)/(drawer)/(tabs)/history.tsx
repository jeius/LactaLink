import React, { FC } from 'react';

import { InfiniteList, InfiniteListItemProps } from '@/components/lists/InfiniteList';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import { Text } from '@/components/ui/text';

export default function HistoryPage() {
  const Item: FC<InfiniteListItemProps<'transactions'>> = ({ item, isLoading }) => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    return <Text>{item.id}</Text>;
  };

  return (
    <SafeArea safeTop={false}>
      <InfiniteList slug="transactions" ItemComponent={Item} />
    </SafeArea>
  );
}
