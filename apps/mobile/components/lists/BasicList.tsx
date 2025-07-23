import { Collection, CollectionSlug, Where } from '@lactalink/types';
import React, { FC, useEffect, useMemo } from 'react';

import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { areStrings, extractCollection, extractID, formatKebab } from '@lactalink/utilities';
import { FlashList, FlashListProps, ListRenderItem, ListRenderItemInfo } from '@shopify/flash-list';
import { NoData } from '../NoData';

export interface BasicListItemProps<TSlug extends CollectionSlug = CollectionSlug>
  extends ListRenderItemInfo<Collection<TSlug>> {
  isLoading: boolean;
}

export interface BasicListProps<TSlug extends CollectionSlug = CollectionSlug>
  extends Omit<
    FlashListProps<Collection<TSlug>>,
    | 'data'
    | 'renderItem'
    | 'refreshControl'
    | 'ItemSeparatorComponent'
    | 'ListEmptyComponent'
    | 'estimatedListSize'
  > {
  data: (string | Collection<TSlug>)[];
  slug: TSlug;
  ItemComponent: FC<BasicListItemProps<TSlug>>;
  onChange?: (value: Collection<TSlug>[]) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  gap?: number;
  ItemSeparatorComponent?: FC;
  placeholderLength?: number;
}

export function BasicList<TSlug extends CollectionSlug = CollectionSlug>({
  data: dataProp,
  slug,
  onChange,
  isLoading: isLoadingProp,
  isFetching: isFetchingProp,
  gap = 12,
  onRefresh,
  refreshing,
  ItemComponent,
  ItemSeparatorComponent,
  placeholderLength = 3,
  ...props
}: BasicListProps<TSlug>) {
  const placeholderData = Array.from({ length: placeholderLength }, (_, index) => ({
    id: `placeholder-${index}`,
  })) as Collection<TSlug>[];

  const shouldFetch = areStrings(dataProp);

  const dataIDs = useMemo(
    () => (shouldFetch && extractID(dataProp)) || [],
    [shouldFetch, dataProp]
  );

  const where: Where | undefined = dataIDs.length > 0 ? { id: { in: dataIDs } } : undefined;

  const {
    data: fetchedData,
    isLoading: isLoadingData,
    isFetching: isFetchingData,
    refetch: refetchData,
    error,
  } = useFetchBySlug(Boolean(dataIDs.length > 0), {
    collection: slug,
    where,
  });

  const isLoading = isLoadingProp || isLoadingData;
  const isFetching = isFetchingProp || isFetchingData;

  const data = useMemo(
    () => (shouldFetch ? fetchedData : extractCollection(dataProp)) || [],
    [shouldFetch, fetchedData, dataProp]
  );

  useEffect(() => {
    if (data && data.length > 0) {
      onChange?.(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const renderItem: ListRenderItem<Collection<TSlug>> = (props) => {
    const isLoading = props.item.id.includes('placeholder');
    return <ItemComponent {...props} isLoading={isLoading} />;
  };

  function handleRefresh() {
    onRefresh?.();
    refetchData();
  }

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
      data={isLoading ? placeholderData : data}
      renderItem={renderItem}
      keyExtractor={(item, index) => props.keyExtractor?.(item, index) || item.id}
      ListEmptyComponent={EmptyComponent}
      ItemSeparatorComponent={SeparatorComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || (!isLoading && isFetching)}
          onRefresh={handleRefresh}
        />
      }
    />
  );
}
