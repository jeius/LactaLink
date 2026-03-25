import { type FC, type JSX, type PropsWithoutRef, type RefAttributes, forwardRef } from 'react';
import { NoData } from '../../NoData';
import { BottomSheetFlashList } from '../bottom-sheet';
import { Box } from '../box';
import { FlashList, FlashListProps, FlashListRef, ListRenderItemInfo } from '../FlashList';
import { Spinner } from '../spinner';

type RenderItemInfo<T> = {
  isPlaceholder: boolean;
} & ListRenderItemInfo<T>;

type OmittedListProps<T> = Omit<FlashListProps<T>, 'renderItem'>;

type InfiniteFlashListRef<T> = FlashListRef<T>;

type ListRenderItem<T> = (info: RenderItemInfo<T>) => React.ReactElement | null;

type InfiniteFlashListProps<T> = OmittedListProps<T> & {
  gap?: number;
  emptyListLabel?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  isPlaceholderData?: boolean;
  renderItem: ListRenderItem<T>;
  listComponentType?: 'flashList' | 'bottomSheetFlashList';
};

const InfiniteFlashList = forwardRef(function InfiniteFlashList<T>(
  {
    gap = 0,
    emptyListLabel,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    keyboardShouldPersistTaps = 'always',
    isPlaceholderData = false,
    listComponentType = 'flashList',
    ...props
  }: InfiniteFlashListProps<T>,
  ref: React.ForwardedRef<FlashListRef<T>>
) {
  const Component = listComponentType === 'bottomSheetFlashList' ? BottomSheetFlashList : FlashList;

  return (
    <Component
      {...props}
      ref={ref}
      renderItem={(info) => props.renderItem({ ...info, isPlaceholder: isPlaceholderData })}
      onEndReachedThreshold={props.onEndReachedThreshold ?? 0.2}
      onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
      contentContainerStyle={[props.contentContainerStyle, { flexGrow: 1 }]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
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
}) as <T>(
  props: PropsWithoutRef<InfiniteFlashListProps<T>> & RefAttributes<FlashListRef<T>>
) => JSX.Element;

(InfiniteFlashList as FC).displayName = 'InfiniteFlashList';

export { InfiniteFlashList };
export type { InfiniteFlashListProps, InfiniteFlashListRef, ListRenderItem, ListRenderItemInfo };
