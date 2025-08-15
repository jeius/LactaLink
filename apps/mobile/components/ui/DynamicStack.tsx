import { isWeb } from '@gluestack-ui/nativewind-utils/IsWeb';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import React from 'react';
import { View } from 'react-native';

const baseStyle = isWeb
  ? 'flex relative z-0 box-border border-0 list-none min-w-0 min-h-0 bg-transparent items-stretch m-0 p-0 text-decoration-none'
  : '';

export const dynamicStackStyle = tva({
  base: baseStyle,
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-5',
      '2xl': 'gap-6',
      '3xl': 'gap-7',
      '4xl': 'gap-8',
    },
    reversed: {
      true: 'flex-col-reverse',
    },
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
});

type IVStackProps = React.ComponentProps<typeof View> & VariantProps<typeof dynamicStackStyle>;

const DynamicStack = React.forwardRef<React.ComponentRef<typeof View>, IVStackProps>(function Stack(
  { className, space, reversed, orientation, ...props },
  ref
) {
  return (
    <View
      className={dynamicStackStyle({ space, reversed, orientation, class: className })}
      {...props}
      ref={ref}
    />
  );
});

DynamicStack.displayName = 'DynamicStack';

export { DynamicStack };
