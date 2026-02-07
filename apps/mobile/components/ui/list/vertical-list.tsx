import React from 'react';

import { ListRenderItem } from '@/lib/types';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { NoData } from '../../NoData';
import { RefreshControl } from '../../RefreshControl';
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
  ...props
}: VerticalInfiniteListProps<T>) {
  return (
    <FlashList
      {...props}
      renderItem={(info) => props.renderItem({ ...info, isPlaceholder: isPlaceholderData })}
      ListFooterComponent={
        isFetchingNextPage ? <Spinner size="small" className="mx-auto mb-4" /> : null
      }
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
    />
  );
}
