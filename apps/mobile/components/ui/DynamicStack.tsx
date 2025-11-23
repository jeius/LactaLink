import { tva } from '@gluestack-ui/nativewind-utils/tva';

import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import React from 'react';
import { View } from 'react-native';

const dynamicStackStyle = tva({
  base: 'items-stretch',
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
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
});

type IVStackProps = React.ComponentProps<typeof View> & VariantProps<typeof dynamicStackStyle>;

const DynamicStack = React.forwardRef<React.ComponentRef<typeof View>, IVStackProps>(function Stack(
  { className, space, orientation, ...props },
  ref
) {
  return (
    <View
      className={dynamicStackStyle({ space, orientation, class: className })}
      {...props}
      ref={ref}
    />
  );
});

DynamicStack.displayName = 'DynamicStack';

export { DynamicStack };
export type { IVStackProps as DynamicStackProps };
