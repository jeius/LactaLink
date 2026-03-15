import { FlashList as FlashListComponent, FlashListProps, FlashListRef } from '@shopify/flash-list';
import React, { ForwardedRef, forwardRef } from 'react';
import { Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { RefreshControl } from '../RefreshControl';

type Props<T> = Omit<FlashListProps<T>, 'refreshControl'>;

function FlashListInner<T>(props: Props<T>, ref: ForwardedRef<FlashListRef<T>>) {
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
      refreshControl={Platform.select({
        // Note: nestedScrollEnabled on Android causes the FlashList to ignore the
        // built-in RefreshControl, so we conditionally render it based on that prop.
        android: nestedScrollEnabled ? undefined : (
          <RefreshControl
            progressViewOffset={progressViewOffset}
            refreshing={refreshing ?? false}
            onRefresh={onRefresh ?? (() => {})}
          />
        ),
        default: (
          <RefreshControl
            progressViewOffset={progressViewOffset}
            refreshing={refreshing ?? false}
            onRefresh={onRefresh ?? (() => {})}
          />
        ),
      })}
    />
  );
}

/**
 * A wrapper around the FlashList component from `@shopify/flash-list` that provides some
 * default props and handles the refresh control.
 *
 * @remarks
 * Android: Disables the pull-to-refresh functionality when `nestedScrollEnabled` is
 * `true` due to Android limitations.
 */
export const FlashList = forwardRef(FlashListInner) as <T>(
  props: Props<T> & React.RefAttributes<FlashListRef<T>>
) => React.ReactElement;

export type { FlashListRef } from '@shopify/flash-list';
export type { Props as FlashListProps };
