import { tva } from '@gluestack-ui/nativewind-utils/tva';

export const itemStyle = tva({
  base: 'text-wrap text-sm',
  variants: {
    variant: {
      primary: 'text-primary-600',
      secondary: 'text-secondary-500',
      tertiary: 'text-tertiary-600',
      muted: 'text-typography-700',
      destructive: 'text-error-500',
    },
  },
});

export const iconStyle = tva({
  base: '',
  variants: {
    variant: {
      primary: 'text-primary-600',
      secondary: 'text-secondary-500',
      tertiary: 'text-tertiary-600',
      muted: 'text-typography-600',
      destructive: 'text-error-500',
    },
  },
});
