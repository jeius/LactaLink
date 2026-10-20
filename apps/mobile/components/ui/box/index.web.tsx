import React from 'react';
import { StyleSheet } from 'react-native';
import { boxStyle } from './styles';

import type { VariantProps } from '@gluestack-ui/nativewind-utils';

type IBoxProps = React.ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof boxStyle> & { className?: string };

const Box = React.forwardRef<HTMLDivElement, IBoxProps>(function Box({ className, ...props }, ref) {
  const { style, onLayout: _onLayout, nativeID, forwardedRef: _forwardedRef, ...webProps } =
    props as typeof props & { forwardedRef?: unknown; nativeID?: string; onLayout?: unknown };
  return (
    <div
      {...webProps}
      id={nativeID ?? webProps.id}
      ref={ref}
      className={boxStyle({ class: className })}
      style={StyleSheet.flatten(style) as React.CSSProperties}
    />
  );
});

Box.displayName = 'Box';
export { Box };
