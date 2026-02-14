import React from 'react';

import { ListRenderItem } from '@/lib/types';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { NoData } from '../../NoData';
import { RefreshControl } from '../../RefreshControl';
import { BottomSheetFlashList } from '../bottom-sheet';
import { Box } from '../box';
import { Spinner } from '../spinner';

type OmittedFlashListProps<T> = Omit<FlashListProps<T>, 'refreshControl' | 'renderItem'>;

export interface VerticalInfiniteListProps<T> extends OmittedFlashListProps<T> {
  gap?: number;
  emptyListLabel?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  isPlaceholderData?: boolean;
  renderItem: ListRenderItem<T>;
  useBottomSheetListComponent?: boolean;
}

export function VerticalInfiniteList<T>({
  gap = 0,
  emptyListLabel,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onRefresh,
  refreshing,
  keyboardShouldPersistTaps = 'always',
  isPlaceholderData = false,
  useBottomSheetListComponent = false,
  ...props
}: VerticalInfiniteListProps<T>) {
  const FlashListComponent = useBottomSheetListComponent ? BottomSheetFlashList : FlashList;

  return (
    <FlashListComponent
      {...props}
      renderItem={(info) => props.renderItem({ ...info, isPlaceholder: isPlaceholderData })}
      onEndReachedThreshold={props.onEndReachedThreshold ?? 0.2}
      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
      contentContainerStyle={[props.contentContainerStyle, { flexGrow: 1 }]}
      showsVerticalScrollIndicator={props.showsVerticalScrollIndicator ?? false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      refreshControl={
        <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh ?? undefined} />
      }
      ItemSeparatorComponent={
        props.ItemSeparatorComponent ?? (() => <Box style={{ height: gap }} />)
      }
      ListEmptyComponent={
        props.ListEmptyComponent ?? <NoData title={emptyListLabel || `Nothing to show here`} />
      }
      ListFooterComponentStyle={[
        { alignItems: 'center', justifyContent: 'center' },
        props.ListFooterComponentStyle,
      ]}
      ListFooterComponent={
        props.ListFooterComponent ?? (
          <Box>{isFetchingNextPage && <Spinner size="small" className="m-4" />}</Box>
        )
      }
    />
  );
}
