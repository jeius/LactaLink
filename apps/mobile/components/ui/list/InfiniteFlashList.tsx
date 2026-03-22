import React from 'react';

import { FlashList, FlashListProps, ListRenderItemInfo } from '@shopify/flash-list';
import { ScrollView } from 'react-native-gesture-handler';
import { NoData } from '../../NoData';
import { RefreshControl } from '../../RefreshControl';
import { BottomSheetFlashList } from '../bottom-sheet';
import { Box } from '../box';
import { Spinner } from '../spinner';

type RenderItemInfo<T> = {
  isPlaceholder: boolean;
} & ListRenderItemInfo<T>;

type OmittedListProps<T> = Omit<FlashListProps<T>, 'refreshControl' | 'renderItem'>;

export type ListRenderItem<T> = (info: RenderItemInfo<T>) => React.ReactElement | null;

export type InfiniteFlashListProps<T> = OmittedListProps<T> & {
  gap?: number;
  emptyListLabel?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  isPlaceholderData?: boolean;
  renderItem: ListRenderItem<T>;
  listComponentType?: 'flashList' | 'bottomSheetFlashList';
};

export function InfiniteFlashList<T>({
  gap = 0,
  emptyListLabel,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onRefresh,
  refreshing,
  keyboardShouldPersistTaps = 'always',
  isPlaceholderData = false,
  listComponentType = 'flashList',
  ...props
}: InfiniteFlashListProps<T>) {
  const Component = listComponentType === 'bottomSheetFlashList' ? BottomSheetFlashList : FlashList;

  return (
    <Component
      {...props}
      renderItem={(info) => props.renderItem({ ...info, isPlaceholder: isPlaceholderData })}
      onEndReachedThreshold={props.onEndReachedThreshold ?? 0.2}
      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
      contentContainerStyle={[props.contentContainerStyle, { flexGrow: 1 }]}
      showsVerticalScrollIndicator={props.showsVerticalScrollIndicator ?? false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      renderScrollComponent={ScrollView}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} />
        ) : undefined
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
