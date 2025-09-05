import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import React, { ComponentProps } from 'react';
import { Box } from '../ui/box';
import { Text } from '../ui/text';

const style = tva({
  base: 'rounded-full px-2 py-1',
  variants: {
    variant: {
      primary: 'bg-primary-500',
      'primary-light': 'bg-primary-0',
      secondary: 'bg-secondary-500',
      tertiary: 'bg-tertiary-500',
      muted: 'bg-background-200',
      error: 'bg-error-500',
      warning: 'bg-warning-500',
      success: 'bg-success-500',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

const textStyle = tva({
  base: 'font-JakartaMedium text-center',
  variants: {
    variant: {
      primary: 'text-primary-0',
      'primary-light': 'text-primary-500',
      secondary: 'text-secondary-0',
      tertiary: 'text-tertiary-0',
      muted: 'text-background-900',
      error: 'text-error-0',
      warning: 'text-warning-0',
      success: 'text-success-0',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

interface NumberBadgeProps extends ComponentProps<typeof Box>, VariantProps<typeof style> {
  count: number;
}

export default function NumberBadge({ count, variant, className, ...props }: NumberBadgeProps) {
  const badgeCount = createNumberBadge(count);

  if (!badgeCount) return null;

  return (
    <Box
      {...props}
      className={style({ variant, className })}
      style={[{ minWidth: 20, minHeight: 20 }, props.style]}
    >
      <Text size="xs" className={textStyle({ variant })}>
        {badgeCount}
      </Text>
    </Box>
  );
}

function createNumberBadge(count: number) {
  if (count > 100) return '99+';
  if (count === 0) return undefined;
  return count.toString();
}
