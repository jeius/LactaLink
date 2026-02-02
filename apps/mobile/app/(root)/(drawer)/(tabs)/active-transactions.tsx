import React, { FC, useCallback } from 'react';

import { useHeaderScrollHandler, useHeaderSize } from '@/components/contexts/HeaderProvider';
import { NoData } from '@/components/NoData';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import TransactionListItem from '@/features/transactions/components/TransactionListItem';
import { useInfiniteTransactions } from '@/features/transactions/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { FlashList, FlashListProps, ListRenderItem } from '@shopify/flash-list';
import { Link } from 'expo-router';
import { ChevronRightIcon } from 'lucide-react-native';
import Animated, { AnimatedProps } from 'react-native-reanimated';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as FC<
  AnimatedProps<FlashListProps<Transaction>>
>;

export default function TransactionsTab() {
  const { data: meUser = null } = useMeUser();

  const { data, ...query } = useInfiniteTransactions();

  const scrollHandler = useHeaderScrollHandler();

  const { height: headerHeight } = useHeaderSize();

  const renderItem = useCallback<ListRenderItem<Transaction>>(
    ({ item }) => {
      if (isPlaceHolderData(item))
        return <Skeleton className="rounded-2xl" style={{ height: 112 }} />;
      return (
        <Link href={`/transactions/${item.id}`} asChild push>
          <TransactionListItem data={item} showBadge user={meUser} />
        </Link>
      );
    },
    [meUser]
  );

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
        <Text size="lg" bold>
          Active Transactions
        </Text>
        {!isEmpty && (
          <Link href="/account/transactions" asChild push>
            <Button
              size="sm"
              variant="link"
              action="default"
              className="h-fit w-fit p-0"
              hitSlop={8}
            >
              <ButtonText className="font-sans">See All</ButtonText>
              <ButtonIcon as={ChevronRightIcon} />
            </Button>
          </Link>
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
        ListHeaderComponentStyle={{ marginBottom: 8 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        keyExtractor={listKeyExtractor}
        ListFooterComponent={query.isFetchingNextPage ? <Spinner size="small" /> : null}
        ListFooterComponentStyle={{ marginTop: 8 }}
        onEndReachedThreshold={0.25}
        onEndReached={handleFetchNextPage}
        refreshControl={
          <RefreshControl
            progressViewOffset={headerHeight}
            refreshing={query.isRefetching}
            onRefresh={query.refetch}
          />
        }
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 160,
          marginTop: headerHeight,
          flexGrow: 1,
        }}
      />
    </SafeArea>
  );
}
