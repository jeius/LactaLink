'use client';
import { forwardRef, useCallback, useEffect, useRef } from 'react';
import {
  GestureResponderEvent,
  Platform,
  PressableProps,
  Pressable as RNPressable,
} from 'react-native';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { tva } from '@gluestack-ui/utils/nativewind-utils';

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

type IPressableProps = PressableProps & {
  /**
   * A key that resets the internal state of the Pressable when it changes.
   * This is useful when using Pressable in a list where items can be recycled,
   * to prevent visual glitches from lingering state.
   */
  recyclingKey?: string;
};

const Pressable = forwardRef<React.ComponentRef<typeof RNPressable>, IPressableProps>(
  function Pressable(
    {
      android_ripple = {},
      className,
      disabled,
      recyclingKey,
      onTouchStart,
      onTouchMove,
      onLongPress,
      ...props
    },
    ref
  ) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const swipeCancelled = useRef(false);
    const touchStart = useRef({ x: 0, y: 0 });

    const handleTouchStart = useCallback(
      (e: GestureResponderEvent) => {
        e.persist();
        onTouchStart?.(e);
        if (e.defaultPrevented) return;

        swipeCancelled.current = false;
        touchStart.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
      },
      [onTouchStart]
    );

    const handleTouchMove = useCallback(
      (e: GestureResponderEvent) => {
        e.persist();
        onTouchMove?.(e);
        if (e.defaultPrevented) return;

        const dx = Math.abs(e.nativeEvent.pageX - touchStart.current.x);
        const dy = Math.abs(e.nativeEvent.pageY - touchStart.current.y);
        if (dx > 10 || dy > 10) swipeCancelled.current = true;
      },
      [onTouchMove]
    );

    const handleLongPress = useCallback(
      (e: GestureResponderEvent) => {
        if (swipeCancelled.current) return; // Exit if the long press was part of a swipe gesture
        onLongPress?.(e);
      },
      [onLongPress]
    );

    useEffect(() => {
      if (!recyclingKey) return;
      swipeCancelled.current = false;
      touchStart.current = { x: 0, y: 0 };
    }, [recyclingKey]);

    return (
      <RNPressable
        {...props}
        ref={ref}
        disabled={disabled}
        className={pressableStyle({ class: className, isIos: Platform.OS === 'ios' })}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onLongPress={handleLongPress}
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
