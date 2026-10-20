import React from 'react';
import { StyleSheet } from 'react-native';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';

import { vstackStyle } from './styles';

type IVStackProps = React.ComponentProps<'div'> & VariantProps<typeof vstackStyle>;

const VStack = React.forwardRef<React.ComponentRef<'div'>, IVStackProps>(function VStack(
  { className, space, reversed, ...props },
  ref
) {
  const { style, onLayout: _onLayout, nativeID, forwardedRef: _forwardedRef, ...webProps } =
    props as typeof props & { forwardedRef?: unknown; nativeID?: string; onLayout?: unknown };
  return (
    <div
      {...webProps}
      id={nativeID ?? webProps.id}
      className={vstackStyle({ space, reversed, class: className })}
      style={StyleSheet.flatten(style) as React.CSSProperties}
      ref={ref}
    />
  );
});

VStack.displayName = 'VStack';

export { VStack };
