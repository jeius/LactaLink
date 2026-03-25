import { FlashList as FlashListComponent, FlashListProps, FlashListRef } from '@shopify/flash-list';
import { cssInterop } from 'nativewind';
import { forwardRef, type FC, type ForwardedRef, type PropsWithoutRef } from 'react';
import { Platform, ViewProps } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { RefreshControl } from '../RefreshControl';

type Props<T> = Omit<FlashListProps<T>, 'refreshControl'> & {
  headerClassName?: ViewProps['className'];
  footerClassName?: ViewProps['className'];
};

/**
 * A wrapper around the FlashList component from `@shopify/flash-list` that provides some
 * default props and handles the refresh control.
 *
 * @remarks
 * Android: Disables the pull-to-refresh functionality when `nestedScrollEnabled` is
 * `true` due to Android limitations.
 */
const FlashList = forwardRef(function FlashList<T>(
  props: Props<T>,
  ref: ForwardedRef<FlashListRef<T>>
) {
  const {
    showsHorizontalScrollIndicator = false,
    showsVerticalScrollIndicator = false,
    refreshing,
    onRefresh,
    nestedScrollEnabled = false,
    progressViewOffset,
    renderScrollComponent = ScrollView,
    ...rest
  } = props;

  return (
    <FlashListComponent
      {...rest}
      ref={ref}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      nestedScrollEnabled={nestedScrollEnabled}
      renderScrollComponent={renderScrollComponent}
      refreshControl={
        !onRefresh
          ? undefined
          : Platform.select({
              // Note: nestedScrollEnabled on Android causes the FlashList to ignore the
              // built-in RefreshControl, so we conditionally render it based on that prop.
              android: nestedScrollEnabled ? undefined : (
                <RefreshControl
                  progressViewOffset={progressViewOffset}
                  refreshing={refreshing ?? false}
                  onRefresh={onRefresh}
                />
              ),
              default: (
                <RefreshControl
                  progressViewOffset={progressViewOffset}
                  refreshing={refreshing ?? false}
                  onRefresh={onRefresh}
                />
              ),
            })
      }
    />
  );
}) as <T>(
  props: PropsWithoutRef<Props<T>> & React.RefAttributes<FlashListRef<T>>
) => React.ReactElement;

(FlashList as FC).displayName = 'FlashList';

cssInterop(FlashList, {
  headerClassName: 'ListHeaderComponentStyle',
  footerClassName: 'ListFooterComponentStyle',
});

export type { FlashListRef, ListRenderItem, ListRenderItemInfo } from '@shopify/flash-list';
export { FlashList };
export type { Props as FlashListProps };
