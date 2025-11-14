import {
  CollectionSlug,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
} from '@lactalink/types/payload-types';
import React, { FC, useCallback, useEffect, useMemo } from 'react';

import { Box } from '@/components/ui/box';
import {
  InfiniteFetchOptions,
  InfiniteQueryOptions,
  useInfiniteFetchBySlug,
} from '@/hooks/collections/useInfiniteFetchBySlug';
import { MarkOptional } from '@lactalink/types/utils';
import { formatKebab } from '@lactalink/utilities/formatters';

import { listKeyExtractor } from '@lactalink/utilities/extractors';
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
  fetchOptions?: MarkOptional<InfiniteFetchOptions<TSlug, TSelect>, 'collection'>;
  queryOptions?: InfiniteQueryOptions<TSlug, TSelect>;
  onChange?: (value: TransformCollectionWithSelect<TSlug, TSelect>[]) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  gap?: number;
  ItemSeparatorComponent?: FC;
  ListEmptyComponent?: FC;
  ItemComponent: FC<InfiniteListItemProps<TSlug, TSelect>>;
  emptyListLabel?: string;
}

export function InfiniteList<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
>({
  fetchOptions,
  queryOptions,
  slug,
  onChange,
  isLoading: isLoadingProp,
  isFetching: isFetchingProp,
  gap = 12,
  ItemSeparatorComponent,
  ItemComponent,
  emptyListLabel,
  ListEmptyComponent,
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
  } = useInfiniteFetchBySlug(true, { collection: slug, ...fetchOptions }, queryOptions);

  const isLoading = isLoadingProp || isLoadingData;
  const isFetching = isFetchingProp || isRefetching;

  const data = useMemo(() => {
    if (paginatedData) {
      return paginatedData.pages.flatMap((page) => page.docs);
    } else if (isLoading) {
      return Array.from(
        { length: 20 },
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
  }, [data]);

  const renderItem = useCallback<ListRenderItem<TransformCollectionWithSelect<TSlug, TSelect>>>(
    (props) => {
      const isPlaceholder = props.item.id.includes('placeholder');
      return <ItemComponent {...props} isLoading={isPlaceholder || isLoading} />;
    },
    [ItemComponent, isLoading]
  );

  function EmptyComponent() {
    if (ListEmptyComponent) {
      return <ListEmptyComponent />;
    }
    return !isLoading && <NoData title={emptyListLabel || `No ${formatKebab(slug)} found`} />;
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
      keyExtractor={props.keyExtractor || listKeyExtractor}
      renderItem={renderItem}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={SeparatorComponent}
      ListFooterComponent={isFetchingNextPage ? <Spinner size="small" /> : null}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      onEndReachedThreshold={0.2}
      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
      contentContainerStyle={[props.contentContainerStyle, { flexGrow: 1 }]}
    />
  );
}
