import {
  CollectionSlug,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
} from '@lactalink/types';
import React, { FC, useCallback, useEffect, useMemo } from 'react';

import { Box } from '@/components/ui/box';
import {
  InfiniteFetchOptions,
  useInfiniteFetchBySlug,
} from '@/hooks/collections/useInfiniteFetchBySlug';
import { formatKebab } from '@lactalink/utilities';
import { FlashList, FlashListProps, ListRenderItem, ListRenderItemInfo } from '@shopify/flash-list';
import { randomUUID } from 'expo-crypto';
import { NoData } from '../NoData';
import { RefreshControl } from '../RefreshControl';
import { Spinner } from '../ui/spinner';

export interface InfiniteListItemProps<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> extends ListRenderItemInfo<TransformCollectionWithSelect<TSlug, TSelect>> {
  isLoading: boolean;
}

type OmittedFlashListProps<T> = Omit<
  FlashListProps<T>,
  | 'data'
  | 'renderItem'
  | 'refreshControl'
  | 'ItemSeparatorComponent'
  | 'ListEmptyComponent'
  | 'onRefresh'
  | 'refreshing'
>;

export interface InfiniteListProps<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> extends OmittedFlashListProps<TransformCollectionWithSelect<TSlug, TSelect>> {
  slug: TSlug;
  fetchOptions?: InfiniteFetchOptions<TSlug, TSelect>;
  onChange?: (value: TransformCollectionWithSelect<TSlug, TSelect>[]) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  gap?: number;
  ItemSeparatorComponent?: FC;
  ItemComponent: FC<InfiniteListItemProps<TSlug, TSelect>>;
}

export function InfiniteList<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
>({
  fetchOptions,
  slug,
  onChange,
  isLoading: isLoadingProp,
  isFetching: isFetchingProp,
  gap = 12,
  ItemSeparatorComponent,
  ItemComponent,
  ...props
}: InfiniteListProps<TSlug, TSelect>) {
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
      return paginatedData.pages.flatMap((page) => page.docs);
    } else if (isLoading) {
      return Array.from(
        { length: 100 },
        (_, index) =>
          ({
            id: `placeholder-${index}-${randomUUID()}`,
          }) as TransformCollectionWithSelect<TSlug, TSelect>
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

  const renderItem = useCallback<ListRenderItem<TransformCollectionWithSelect<TSlug, TSelect>>>(
    (props) => {
      const isPlaceholder = props.item.id.includes('placeholder');
      return <ItemComponent {...props} isLoading={isPlaceholder || isLoading} />;
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
      maintainVisibleContentPosition={{ disabled: true }}
      keyExtractor={(item, index) => props.keyExtractor?.(item, index) || `${item.id}-${index}`}
      renderItem={renderItem}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={SeparatorComponent}
      ListFooterComponent={isFetchingNextPage ? <Spinner size="small" /> : null}
      refreshControl={<RefreshControl refreshing={!isLoading && isFetching} onRefresh={refetch} />}
      onEndReachedThreshold={0.2}
      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
    />
  );
}
