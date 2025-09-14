import {
  CollectionSlug,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
  Where,
} from '@lactalink/types/payload-types';
import React, { FC, useEffect, useMemo } from 'react';

import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { formatKebab } from '@lactalink/utilities/formatters';
import { areStrings } from '@lactalink/utilities/type-guards';
import { FlashList, FlashListProps, ListRenderItemInfo } from '@shopify/flash-list';
import { NoData } from '../NoData';

export interface BasicListItemProps<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> extends ListRenderItemInfo<TransformCollectionWithSelect<TSlug, TSelect>> {
  isLoading: boolean;
}

export interface BasicListProps<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> extends Omit<
    FlashListProps<TransformCollectionWithSelect<TSlug, TSelect>>,
    'data' | 'renderItem' | 'refreshControl' | 'ItemSeparatorComponent' | 'ListEmptyComponent'
  > {
  data: (string | TransformCollectionWithSelect<TSlug, TSelect>)[];
  slug: TSlug;
  ItemComponent: FC<BasicListItemProps<TSlug, TSelect>>;
  onChange?: (value: TransformCollectionWithSelect<TSlug, TSelect>[]) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  gap?: number;
  ItemSeparatorComponent?: FC;
  placeholderLength?: number;
}

export function BasicList<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
>({
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
}: BasicListProps<TSlug, TSelect>) {
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
  } = useFetchBySlug<TSlug, TSelect>(Boolean(dataIDs.length > 0), {
    collection: slug,
    where,
  });

  const isLoading = isLoadingProp || isLoadingData;
  const isFetching = isFetchingProp || isFetchingData;

  const data = useMemo(() => {
    if (!isLoading) {
      return (shouldFetch ? fetchedData : (extractCollection(dataProp) as never)) || [];
    } else {
      return Array.from(
        { length: placeholderLength },
        (_, index) =>
          ({
            id: `placeholder-${index}`,
          }) as TransformCollectionWithSelect<TSlug, TSelect>
      );
    }
  }, [isLoading, shouldFetch, fetchedData, dataProp, placeholderLength]);

  useEffect(() => {
    if (data && data.length > 0) {
      onChange?.(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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
      data={data}
      renderItem={(props) => {
        const isLoading = props.item.id.includes('placeholder');
        return <ItemComponent {...props} isLoading={isLoading} />;
      }}
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
