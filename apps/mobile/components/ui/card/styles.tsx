import { isWeb } from '@gluestack-ui/nativewind-utils/IsWeb';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
const baseStyle = isWeb ? 'flex flex-col relative z-0 overflow-hidden' : 'overflow-hidden max-w-md';

export const cardStyle = tva({
  base: baseStyle,
  variants: {
    size: {
      sm: 'rounded p-3',
      md: 'rounded-md p-4',
      lg: 'rounded-xl p-5',
      xl: 'rounded-2xl p-5',
    },
    variant: {
      elevated: 'border border-outline-100 bg-background-0',
      outline: 'border border-outline-200',
      ghost: 'rounded-none',
      filled: 'border border-outline-100 bg-background-0',
    },
  },
  defaultVariants: {
    size: 'xl',
    variants: 'elevated',
  },
});
