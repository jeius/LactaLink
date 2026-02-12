import React from 'react';
import { RefreshControlProps } from 'react-native';
import { ScrollView as RNScrollView } from 'react-native-gesture-handler';
import { RefreshControl } from '../RefreshControl';

type RNScrollViewProps = React.ComponentProps<typeof RNScrollView>;

export interface ScrollViewProps extends Omit<RNScrollViewProps, 'refreshControl'> {
  refreshControlProps?: RefreshControlProps;
}

export default function ScrollView({
  refreshControlProps = { refreshing: false },
  ...props
}: ScrollViewProps) {
  return (
    <RNScrollView
      {...props}
      showsHorizontalScrollIndicator={props.showsHorizontalScrollIndicator ?? false}
      showsVerticalScrollIndicator={props.showsVerticalScrollIndicator ?? false}
      refreshControl={<RefreshControl {...refreshControlProps} />}
      keyboardShouldPersistTaps={props.keyboardShouldPersistTaps ?? 'handled'}
    />
  );
}
