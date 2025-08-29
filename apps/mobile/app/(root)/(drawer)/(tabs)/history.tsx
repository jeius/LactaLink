import React, { useCallback } from 'react';

import TransactionListCard from '@/components/cards/TransactionListCard';
import { useScroll } from '@/components/contexts/ScrollProvider';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { NoData } from '@/components/NoData';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchTransactions } from '@/lib/stores/transactionStore';
import { Transaction } from '@lactalink/types';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useFocusEffect } from 'expo-router';
import { ChevronRightIcon } from 'lucide-react-native';

export default function TransactionsTab() {
  const { onScroll, onScrollBeginDrag, onScrollEndDrag } = useScroll();

  const meUser = useMeUser();

  const { data, isLoading, markDataAsSeen, ...query } = useFetchTransactions();

  const renderItem: ListRenderItem<Transaction> = ({ item }) => {
    const isLoading = item.id.includes('placeholder');
    return <TransactionListCard data={item} user={meUser.data} isLoading={isLoading} />;
  };

  function EmptyComponent() {
    return !isLoading && <NoData title={`No active transactions found`} />;
  }

  function SeparatorComponent() {
    return <Box style={{ height: 12 }} />;
  }

  function HeaderComponent() {
    return (
      <HStack space="sm" className="items-center justify-between">
        <Text size="lg" className="font-JakartaMedium">
          Active Transactions
        </Text>
        <Button size="sm" variant="link" action="default" className="h-fit w-fit p-0" hitSlop={8}>
          <ButtonText className="font-sans">See All</ButtonText>
          <ButtonIcon as={ChevronRightIcon} />
        </Button>
      </HStack>
    );
  }

  useFocusEffect(useCallback(markDataAsSeen, [markDataAsSeen]));

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <FlashList
        data={data}
        renderItem={renderItem}
        ListEmptyComponent={EmptyComponent}
        ItemSeparatorComponent={SeparatorComponent}
        ListHeaderComponent={HeaderComponent}
        ListHeaderComponentStyle={{ marginBottom: 8 }}
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} />
        }
        contentContainerStyle={{ padding: 16 }}
        onScroll={({ nativeEvent }) => onScroll(nativeEvent)}
        onScrollBeginDrag={({ nativeEvent }) => onScrollBeginDrag(nativeEvent)}
        onScrollEndDrag={({ nativeEvent }) => onScrollEndDrag(nativeEvent)}
      />
      <FetchingSpinner isFetching={meUser.isLoading} />
    </SafeArea>
  );
}
