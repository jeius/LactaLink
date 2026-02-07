'use client';
import React from 'react';
import { Platform, PressableProps, Pressable as RNPressable } from 'react-native';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { tva } from '@gluestack-ui/nativewind-utils/tva';

const pressableStyle = tva({
  base: 'disabled:opacity-50',
  variants: {
    isIos: {
      true: 'active:opacity-65',
    },
  },
});

const rippleColor = 'rgba(128,128,128,0.15)';
const darkRippleColor = 'rgba(200,200,200,0.20)';

type IPressableProps = PressableProps;

const Pressable = React.forwardRef<React.ComponentRef<typeof RNPressable>, IPressableProps>(
  function Pressable({ android_ripple = {}, className, disabled, ...props }, ref) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
      <RNPressable
        {...props}
        ref={ref}
        disabled={disabled}
        className={pressableStyle({ class: className, isIos: Platform.OS === 'ios' })}
        android_ripple={
          android_ripple === null
            ? null
            : {
                color: isDark ? darkRippleColor : rippleColor,
                foreground: true,
                ...android_ripple,
              }
        }
      />
    );
  }
);

Pressable.displayName = 'Pressable';
export { Pressable };
export type { IPressableProps as PressableProps };
