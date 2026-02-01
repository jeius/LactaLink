import React from 'react';

import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { NoData } from '../NoData';
import { RefreshControl } from '../RefreshControl';
import { BottomSheetFlashList } from '../ui/bottom-sheet';
import { Box } from '../ui/box';
import { Spinner } from '../ui/spinner';

type OmittedFlashListProps<T> = Omit<FlashListProps<T>, 'refreshControl'>;

export interface VerticalInfiniteListProps<T> extends OmittedFlashListProps<T> {
  gap?: number;
  emptyListLabel?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  useBottomSheetListComponent?: boolean;
}

export function VerticalInfiniteList<T extends { id: string }>({
  gap = 12,
  emptyListLabel,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onRefresh,
  refreshing,
  useBottomSheetListComponent = false,
  ...props
}: VerticalInfiniteListProps<T>) {
  const FlashListComponent = useBottomSheetListComponent ? BottomSheetFlashList : FlashList;
  return (
    <FlashListComponent
      {...props}
      keyExtractor={props.keyExtractor ?? listKeyExtractor}
      ListFooterComponent={isFetchingNextPage ? <Spinner size="small" /> : null}
      onEndReachedThreshold={props.onEndReachedThreshold ?? 0.2}
      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
      contentContainerStyle={[props.contentContainerStyle, { flexGrow: 1 }]}
      showsVerticalScrollIndicator={props.showsVerticalScrollIndicator ?? false}
      refreshControl={
        <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh ?? undefined} />
      }
      ItemSeparatorComponent={
        props.ItemSeparatorComponent ?? (() => <Box style={{ height: gap }} />)
      }
      ListEmptyComponent={
        props.ListEmptyComponent ??
        (() => <NoData title={emptyListLabel || `Nothing to show here`} />)
      }
    />
  );
}
