import { shadow } from '@/lib/utils/shadows';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import React from 'react';
import { View, ViewProps } from 'react-native';
import { cardStyle } from './styles';

type ICardProps = ViewProps &
  VariantProps<typeof cardStyle> & { className?: string; isDisabled?: boolean };

const Card = React.forwardRef<React.ComponentRef<typeof View>, ICardProps>(function Card(
  { className, size = 'xl', variant = 'elevated', isDisabled, ...props },
  ref
) {
  return (
    <View
      className={cardStyle({ size, variant, className: className, isDisabled })}
      {...props}
      style={variant === 'elevated' ? [shadow.sm, props.style] : props.style}
      pointerEvents={isDisabled ? 'none' : 'auto'}
      ref={ref}
    />
  );
});

Card.displayName = 'Card';

export { Card };
export type { ICardProps as CardProps };
