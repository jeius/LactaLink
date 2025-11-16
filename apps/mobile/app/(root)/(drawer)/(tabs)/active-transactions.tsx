import React, { FC, useEffect } from 'react';

import TransactionListCard from '@/components/cards/TransactionListCard';
import { useHeaderScrollHandler, useHeaderSize } from '@/components/contexts/HeaderProvider';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { NoData } from '@/components/NoData';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useTransactions } from '@/hooks/transactions';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { FlashList, FlashListProps, ListRenderItem } from '@shopify/flash-list';
import { ChevronRightIcon } from 'lucide-react-native';
import Animated, { AnimatedProps } from 'react-native-reanimated';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as FC<
  AnimatedProps<FlashListProps<Transaction>>
>;

export default function TransactionsTab() {
  const meUser = useMeUser();

  const { transactions: data, queryMethods: query, markAsSeen } = useTransactions();

  const scrollHandler = useHeaderScrollHandler();

  const { height: headerHeight } = useHeaderSize();

  const renderItem: ListRenderItem<Transaction> = ({ item }) => {
    const isLoading = item.id.includes('placeholder');
    return <TransactionListCard data={item} showBadge user={meUser.data} isLoading={isLoading} />;
  };

  useEffect(() => {
    return () => {
      markAsSeen();
    };
  }, []);

  function EmptyComponent() {
    return !query.isLoading && <NoData title="You have no active transactions" />;
  }

  function SeparatorComponent() {
    return <Box style={{ height: 12 }} />;
  }

  function HeaderComponent() {
    const isEmpty = data.length === 0;
    return (
      <HStack space="sm" className="items-center justify-between">
        <Text size="lg" className="font-JakartaMedium">
          Active Transactions
        </Text>
        {!isEmpty && (
          <Button size="sm" variant="link" action="default" className="h-fit w-fit p-0" hitSlop={8}>
            <ButtonText className="font-sans">See All</ButtonText>
            <ButtonIcon as={ChevronRightIcon} />
          </Button>
        )}
      </HStack>
    );
  }

  function handleFetchNextPage() {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <AnimatedFlashList
        data={data}
        renderItem={renderItem}
        onScroll={scrollHandler}
        ListEmptyComponent={EmptyComponent}
        ItemSeparatorComponent={SeparatorComponent}
        ListHeaderComponent={HeaderComponent}
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} />
        }
        ListHeaderComponentStyle={{ marginBottom: 8 }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 80,
          marginTop: headerHeight,
          flexGrow: 1,
        }}
        ListFooterComponent={query.isFetchingNextPage ? <Spinner size="small" /> : null}
        ListFooterComponentStyle={{ marginTop: 8 }}
        onEndReachedThreshold={0.25}
        onEndReached={handleFetchNextPage}
      />
      <FetchingSpinner isFetching={meUser.isLoading} />
    </SafeArea>
  );
}
