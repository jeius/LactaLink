import React from 'react';
import { Platform } from 'react-native';
import { ScrollView as RNScrollView } from 'react-native-gesture-handler';
import { RefreshControl } from '../RefreshControl';

type RNScrollViewProps = React.ComponentProps<typeof RNScrollView>;

export interface ScrollViewProps extends Omit<RNScrollViewProps, 'refreshControl'> {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function ScrollView({ onRefresh, refreshing, ...props }: ScrollViewProps) {
  return (
    <RNScrollView
      {...props}
      showsHorizontalScrollIndicator={props.showsHorizontalScrollIndicator ?? false}
      showsVerticalScrollIndicator={props.showsVerticalScrollIndicator ?? false}
      keyboardShouldPersistTaps={props.keyboardShouldPersistTaps ?? 'handled'}
      refreshControl={
        // Note: Due to Android's limitation, pull-to-refresh doesn't work when
        // nestedScrollEnabled is true. We can remove this condition once the issue is
        // resolved in future versions.
        Platform.select({
          android: props.nestedScrollEnabled ? undefined : (
            <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} />
          ),
          default: <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} />,
        })
      }
    />
  );
}
