import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import React from 'react';
import { StyleSheet } from 'react-native';
import { cardStyle } from './styles';

type ICardProps = React.ComponentPropsWithoutRef<'div'> & VariantProps<typeof cardStyle>;

const Card = React.forwardRef<HTMLDivElement, ICardProps>(function Card(
  { className, size = 'xl', variant = 'elevated', ...props },
  ref
) {
  const { style, onLayout: _onLayout, nativeID, forwardedRef: _forwardedRef, ...webProps } =
    props as typeof props & { forwardedRef?: unknown; nativeID?: string; onLayout?: unknown };
  return (
    <div
      {...webProps}
      id={nativeID ?? webProps.id}
      className={cardStyle({ size, variant, class: className })}
      style={StyleSheet.flatten(style) as React.CSSProperties}
      ref={ref}
    />
  );
});

Card.displayName = 'Card';

export { Card };
