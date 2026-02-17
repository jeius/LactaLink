import React from 'react';

import { FlatListProps, ListRenderItemInfo } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { NoData } from '../../NoData';
import { RefreshControl } from '../../RefreshControl';
import { BottomSheetFlatList } from '../bottom-sheet';
import { Box } from '../box';
import { Spinner } from '../spinner';

type RenderItemInfo<T> = {
  isPlaceholder: boolean;
} & ListRenderItemInfo<T>;

type ListRenderItem<T> = (info: RenderItemInfo<T>) => React.ReactElement | null;

type OmittedListProps<T> = Omit<FlatListProps<T>, 'refreshControl' | 'renderItem'>;

export type InfiniteFlatListProps<T> = OmittedListProps<T> & {
  gap?: number;
  emptyListLabel?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  isPlaceholderData?: boolean;
  renderItem: ListRenderItem<T>;
  listComponentType?: 'flatList' | 'bottomSheetFlatList';
};

export function InfiniteFlatList<T>({
  gap = 0,
  emptyListLabel,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onRefresh,
  refreshing,
  keyboardShouldPersistTaps = 'always',
  isPlaceholderData = false,
  listComponentType = 'flatList',
  ...props
}: InfiniteFlatListProps<T>) {
  const Component = listComponentType === 'bottomSheetFlatList' ? BottomSheetFlatList : FlatList;

  return (
    <Component
      {...props}
      renderItem={(info) => props.renderItem({ ...info, isPlaceholder: isPlaceholderData })}
      onEndReachedThreshold={props.onEndReachedThreshold ?? 0.2}
      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
      contentContainerStyle={[props.contentContainerStyle, { flexGrow: 1 }]}
      showsVerticalScrollIndicator={props.showsVerticalScrollIndicator ?? false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
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
