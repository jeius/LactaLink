import { Collection, CollectionSlug } from '@lactalink/types';
import React, { ComponentProps, FC, useCallback, useEffect, useMemo } from 'react';

import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import {
  InfiniteFetchOptions,
  useInfiniteFetchBySlug,
} from '@/hooks/collections/useInfiniteFetchBySlug';
import { formatKebab } from '@lactalink/utilities';
import { FlashList, ListRenderItem, ListRenderItemInfo } from '@shopify/flash-list';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NoData } from '../NoData';
import { Spinner } from '../ui/spinner';

export interface InfiniteListItemProps<TSlug extends CollectionSlug = CollectionSlug>
  extends ListRenderItemInfo<Collection<TSlug>> {
  isLoading: boolean;
}

type FlashListProps<TSlug extends CollectionSlug = CollectionSlug> = Omit<
  ComponentProps<typeof FlashList<Collection<TSlug>>>,
  | 'data'
  | 'renderItem'
  | 'refreshControl'
  | 'ItemSeparatorComponent'
  | 'ListEmptyComponent'
  | 'estimatedListSize'
  | 'onRefresh'
  | 'refreshing'
>;

export interface InfiniteListProps<TSlug extends CollectionSlug = CollectionSlug>
  extends FlashListProps<TSlug> {
  slug: TSlug;
  fetchOptions?: InfiniteFetchOptions<TSlug>;
  onChange?: (value: Collection[]) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  gap?: number;
  ItemSeparatorComponent?: FC;
  ItemComponent: FC<InfiniteListItemProps<TSlug>>;
}

export function InfiniteList<TSlug extends CollectionSlug = CollectionSlug>({
  fetchOptions,
  slug,
  style,
  onChange,
  isLoading: isLoadingProp,
  isFetching: isFetchingProp,
  gap = 12,
  ItemSeparatorComponent,
  ItemComponent,
  ...props
}: InfiniteListProps<TSlug>) {
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

  const data = useMemo(() => {
    if (!isLoading && paginatedData) {
      return paginatedData?.pages?.flatMap((page) => page.docs);
    } else if (isLoading) {
      return Array.from(
        { length: 15 },
        (_, index) =>
          ({
            id: `placeholder-${index}`,
          }) as Collection<TSlug>
      );
    }
    return [];
  }, [isLoading, paginatedData]);

  useEffect(() => {
    if (data) {
      onChange?.(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const renderItem = useCallback<ListRenderItem<Collection<TSlug>>>(
    (props) => {
      return <ItemComponent {...props} isLoading={isLoading} />;
    },
    [ItemComponent, isLoading]
  );

  function EmptyComponent() {
    return !isLoading && <NoData title={`No ${formatKebab(slug)} found`} />;
  }

  function SeparatorComponent() {
    if (ItemSeparatorComponent) {
      return <ItemSeparatorComponent />;
    } else {
      return <Box style={{ height: gap }} />;
    }
  }

  return (
    <FlashList
      {...props}
      data={data}
      keyExtractor={(item, index) => props.keyExtractor?.(item, index) || item.id}
      renderItem={renderItem}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={SeparatorComponent}
      ListFooterComponent={isFetchingNextPage ? <Spinner size="small" /> : null}
      estimatedListSize={{ width, height }}
      refreshControl={<RefreshControl refreshing={!isLoading && isFetching} onRefresh={refetch} />}
      onEndReachedThreshold={0.2}
      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
    />
  );
}
