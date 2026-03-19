'use client';
import { createButton } from '@gluestack-ui/core/button/creator';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator';
import {
  useStyleContext,
  withStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import React, { ComponentProps, FC } from 'react';
import { ActivityIndicator, GestureResponderEvent, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  WithTimingConfig,
} from 'react-native-reanimated';
import { Pressable } from '../pressable';
import { buttonGroupStyle, buttonIconStyle, buttonStyle, buttonTextStyle } from './styles';

const SCOPE = 'BUTTON';

const Root = withStyleContext(Pressable, SCOPE);

const UIButton = createButton({
  Root: Root,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: UIIcon,
});

const AnimatedUIButton = Animated.createAnimatedComponent(UIButton);

const timingConfig: WithTimingConfig = {
  duration: 250,
  easing: Easing.out(Easing.ease),
};

cssInterop(PrimitiveIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: 'classNameColor',
      stroke: true,
    },
  },
});

type IButtonProps = Omit<React.ComponentPropsWithoutRef<typeof UIButton>, 'context'> &
  VariantProps<typeof buttonStyle>;

interface ButtonProps extends IButtonProps {
  /**
   * Whether to apply press animation on button press. Default is true.
   * @default true
   * @deprecated Use `disablePressAnimation` instead.
   */
  animateOnPress?: boolean;
  /**
   * Whether to disable press animation on button press. Default is false.
   * @default false
   */
  disablePressAnimation?: boolean;
  disableRipple?: boolean;
  minScale?: number;
}

const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<React.ComponentRef<typeof UIButton>>
> = React.forwardRef<React.ComponentRef<typeof UIButton>, ButtonProps>(function Button(
  {
    className,
    variant = 'solid',
    size = 'md',
    action = 'primary',
    animateOnPress = true,
    disablePressAnimation = false,
    onPressIn,
    onPressOut,
    disableRipple = false,
    minScale = 0.97,
    ...props
  },
  ref
) {
  const progress = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withTiming(progress.value ? minScale : 1, timingConfig);
    return { transform: [{ scale: scale }] };
  });

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!disablePressAnimation && variant !== 'link') progress.set(true);
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    if (!disablePressAnimation && variant !== 'link') progress.set(false);
    onPressOut?.(e);
  };

  return (
    <AnimatedUIButton
      ref={ref}
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={buttonStyle({ variant, size, action, class: className })}
      context={{ variant, size, action }}
      style={[animatedStyle, props.style]}
      android_ripple={disableRipple || variant === 'link' ? null : undefined}
    />
  );
});

type IButtonTextProps = React.ComponentPropsWithoutRef<typeof UIButton.Text> &
  VariantProps<typeof buttonTextStyle> & { className?: string; underlineOnPress?: boolean };

const ButtonText: React.ForwardRefExoticComponent<
  IButtonTextProps & React.RefAttributes<React.ComponentRef<typeof UIButton.Text>>
> = React.forwardRef<React.ComponentRef<typeof UIButton.Text>, IButtonTextProps>(
  function ButtonText(
    { className, variant, size, action, underlineOnPress = false, ...props },
    ref
  ) {
    const {
      variant: parentVariant,
      size: parentSize,
      action: parentAction,
    } = useStyleContext(SCOPE);

    return (
      <UIButton.Text
        {...props}
        ref={ref}
        pointerEvents={props.pointerEvents ?? 'none'}
        className={buttonTextStyle({
          parentVariants: {
            variant: parentVariant,
            size: parentSize,
            action: parentAction,
          },
          variant,
          size,
          action,
          class: className,
          underlineOnPress,
        })}
      />
    );
  }
);

const ButtonSpinner: FC<ComponentProps<typeof UIButton.Spinner>> = ({
  className,
  size,
  ...props
}) => {
  const { variant: parentVariant, size: parentSize, action: parentAction } = useStyleContext(SCOPE);

  return (
    <UIButton.Spinner
      {...props}
      className={buttonIconStyle({
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
          action: parentAction,
        },
        className: className,
      })}
      size={size}
    />
  );
};

type IButtonIcon = React.ComponentPropsWithoutRef<typeof UIButton.Icon> &
  VariantProps<typeof buttonIconStyle> & {
    className?: string | undefined;
    as?: React.ElementType;
    height?: number;
    width?: number;
  };

const ButtonIcon: React.ForwardRefExoticComponent<
  IButtonIcon & React.RefAttributes<React.ComponentRef<typeof UIButton.Icon>>
> = React.forwardRef<React.ComponentRef<typeof UIButton.Icon>, IButtonIcon>(function ButtonIcon(
  { className, size, ...props },
  ref
) {
  const parentVariants = useStyleContext(SCOPE);

  if (typeof size === 'number') {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        size={size}
        className={buttonIconStyle({ parentVariants, class: className })}
      />
    );
  } else if ((props.height !== undefined || props.width !== undefined) && size === undefined) {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ parentVariants, class: className })}
      />
    );
  }
  return (
    <UIButton.Icon
      {...props}
      className={buttonIconStyle({ parentVariants, size, class: className })}
      ref={ref}
    />
  );
});

type IButtonGroupProps = React.ComponentPropsWithoutRef<typeof UIButton.Group> &
  VariantProps<typeof buttonGroupStyle>;

const ButtonGroup = React.forwardRef<React.ComponentRef<typeof UIButton.Group>, IButtonGroupProps>(
  function ButtonGroup(
    { className, space = 'md', isAttached = false, flexDirection = 'column', ...props },
    ref
  ) {
    return (
      <UIButton.Group
        className={buttonGroupStyle({
          class: className,
          space,
          isAttached,
          flexDirection,
        })}
        {...props}
        ref={ref}
      />
    );
  }
);

Button.displayName = 'Button';
ButtonText.displayName = 'ButtonText';
ButtonSpinner.displayName = 'ButtonSpinner';
ButtonIcon.displayName = 'ButtonIcon';
ButtonGroup.displayName = 'ButtonGroup';

export { Button, ButtonGroup, ButtonIcon, ButtonSpinner, ButtonText };
export type {
  IButtonGroupProps as ButtonGroupProps,
  IButtonIcon as ButtonIconProps,
  ButtonProps,
  IButtonTextProps as ButtonTextProps,
};
