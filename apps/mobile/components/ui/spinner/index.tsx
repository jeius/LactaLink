'use client';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { VariantProps } from '@gluestack-ui/nativewind-utils/types';
import { cssInterop } from 'nativewind';
import React from 'react';
import { ActivityIndicator } from 'react-native';

cssInterop(ActivityIndicator, {
  className: { target: 'style', nativeStyleToProp: { color: true } },
});

const spinnerStyle = tva({
  base: '',
  variants: {
    variant: {
      primary: 'text-primary-500',
      secondary: 'text-secondary-500',
      tertiary: 'text-tertiary-500',
      info: 'text-info-500',
      default: 'text-typography-900',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

const Spinner = React.forwardRef<
  React.ComponentRef<typeof ActivityIndicator>,
  React.ComponentProps<typeof ActivityIndicator> & VariantProps<typeof spinnerStyle>
>(function Spinner(
  { className, color, focusable = false, 'aria-label': ariaLabel = 'loading', variant, ...props },
  ref
) {
  return (
    <ActivityIndicator
      ref={ref}
      focusable={focusable}
      aria-label={ariaLabel}
      {...props}
      color={color}
      className={spinnerStyle({ class: className, variant })}
    />
  );
});

Spinner.displayName = 'Spinner';

export { Spinner };
