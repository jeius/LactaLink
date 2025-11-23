import { shadow } from '@/lib/utils/shadows';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { cardStyle } from './styles';

type ICardProps = ViewProps &
  VariantProps<typeof cardStyle> & { className?: string; isDisabled?: boolean };

const Card = React.forwardRef<React.ComponentRef<typeof View>, ICardProps>(function Card(
  { className, size = 'xl', variant = 'elevated', isDisabled = false, ...props },
  ref
) {
  const styles = [StyleSheet.flatten(props.style), { opacity: isDisabled ? 0.6 : 1 }];
  if (variant === 'elevated') {
    styles.push(shadow.sm);
  }

  return (
    <View
      className={cardStyle({ size, variant, className: className })}
      {...props}
      style={styles}
      pointerEvents={isDisabled ? 'none' : 'auto'}
      ref={ref}
    />
  );
});

Card.displayName = 'Card';

export { Card };
export type { ICardProps as CardProps };
