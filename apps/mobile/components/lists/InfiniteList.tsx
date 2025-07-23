import { Collection, CollectionSlug } from '@lactalink/types';
import React, { ComponentProps, useEffect, useMemo } from 'react';

import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import {
  InfiniteFetchOptions,
  useInfiniteFetchBySlug,
} from '@/hooks/collections/useInfiniteFetchBySlug';
import { formatKebab } from '@lactalink/utilities';
import { FlashList } from '@shopify/flash-list';
import { randomUUID } from 'expo-crypto';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NoData } from '../NoData';
import { Spinner } from '../ui/spinner';

const placeholderData: Collection[] = Array.from(
  { length: 30 },
  (_, index) =>
    ({
      id: `placeholder-${index}-${randomUUID()}`,
    }) as Collection
);

type FlashListProps = Omit<ComponentProps<typeof FlashList<Collection>>, 'data'>;

interface InfiniteListProps<T extends CollectionSlug = CollectionSlug> extends FlashListProps {
  slug: T;
  fetchOptions?: InfiniteFetchOptions<T>;
  onChange?: (value: Collection[]) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  gap?: number;
}

export function InfiniteList({
  fetchOptions,
  slug,
  style,
  onChange,
  isLoading: isLoadingProp,
  isFetching: isFetchingProp,
  gap = 12,
  ...props
}: InfiniteListProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const {
    data: paginatedData,
    isLoading: isLoadingData,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteFetchBySlug(slug, true, fetchOptions);

  const isLoading = isLoadingProp || isLoadingData;
  const isFetching = isFetchingProp || isRefetching;

  const data = useMemo(
    () => paginatedData?.pages?.flatMap((page) => page.docs) || [],
    [paginatedData]
  );

  useEffect(() => {
    if (data) {
      onChange?.(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function EmptyComponent() {
    return !isLoading && <NoData title={`No ${formatKebab(slug)} found`} />;
  }

  function SeparatorComponent() {
    return <Box style={{ height: gap }} />;
  }

  return (
    <Box className="flex-1" style={style}>
      <FlashList
        {...props}
        data={isLoading ? placeholderData : data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={EmptyComponent}
        ItemSeparatorComponent={SeparatorComponent}
        ListFooterComponent={isFetchingNextPage ? <Spinner size="small" /> : null}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        estimatedItemSize={120}
        estimatedListSize={{ width, height }}
        refreshControl={
          <RefreshControl refreshing={!isLoading && isFetching} onRefresh={refetch} />
        }
        onEndReachedThreshold={0.2}
        onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
      />
    </Box>
  );
}
