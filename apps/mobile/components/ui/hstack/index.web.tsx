import React from 'react';
import { StyleSheet } from 'react-native';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { hstackStyle } from './styles';

type IHStackProps = React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof hstackStyle>;

const HStack = React.forwardRef<React.ComponentRef<'div'>, IHStackProps>(function HStack(
  { className, space, reversed, ...props },
  ref
) {
  const { style, onLayout: _onLayout, nativeID, forwardedRef: _forwardedRef, ...webProps } =
    props as typeof props & { forwardedRef?: unknown; nativeID?: string; onLayout?: unknown };
  return (
    <div
      {...webProps}
      id={nativeID ?? webProps.id}
      className={hstackStyle({ space, reversed, class: className })}
      style={StyleSheet.flatten(style) as React.CSSProperties}
      ref={ref}
    />
  );
});

HStack.displayName = 'HStack';

export { HStack };
