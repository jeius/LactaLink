'use client';
import { createPressable } from '@gluestack-ui/pressable';
import React from 'react';
import { Pressable as RNPressable } from 'react-native';

import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { withStyleContext } from '@gluestack-ui/nativewind-utils/withStyleContext';

const UIPressable = createPressable({
  Root: withStyleContext(RNPressable),
});

const pressableStyle = tva({
  base: 'data-[focus-visible=true]:outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-indicator-info data-[disabled=true]:opacity-40',
});

const rippleColor = 'rgba(128,128,128,0.10)';

type IPressableProps = Omit<React.ComponentProps<typeof UIPressable>, 'context'> &
  VariantProps<typeof pressableStyle>;
const Pressable = React.forwardRef<React.ComponentRef<typeof UIPressable>, IPressableProps>(
  function Pressable({ className, ...props }, ref) {
    return (
      <UIPressable
        {...props}
        ref={ref}
        className={pressableStyle({
          class: className,
        })}
        android_ripple={
          props.android_ripple === undefined
            ? {
                color: rippleColor,
                foreground: true,
              }
            : props.android_ripple
        }
      />
    );
  }
);

Pressable.displayName = 'Pressable';
export { Pressable };
export type { IPressableProps as PressableProps };
