'use client';
import { createButton } from '@gluestack-ui/button';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/icon';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { useStyleContext, withStyleContext } from '@gluestack-ui/nativewind-utils/withStyleContext';
import { cssInterop } from 'nativewind';
import React from 'react';
import { ActivityIndicator, GestureResponderEvent, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const SCOPE = 'BUTTON';

const Root = withStyleContext(Pressable, SCOPE);

const UIButton = createButton({
  Root: Root,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: UIIcon,
});

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

const buttonStyle = tva({
  base: 'group/button bg-background-800 data-[focus-visible=true]:web:outline-none data-[focus-visible=true]:web:ring-2 flex-row items-center justify-center gap-2 rounded-xl data-[disabled=true]:opacity-40',
  variants: {
    action: {
      primary:
        'bg-primary-500 data-[hover=true]:bg-primary-400 data-[active=true]:bg-primary-600 border-primary-400 data-[hover=true]:border-primary-500 data-[active=true]:border-primary-600 data-[focus-visible=true]:web:ring-indicator-info',
      secondary:
        'bg-secondary-500 border-secondary-500 data-[hover=true]:bg-secondary-400 data-[hover=true]:border-secondary-400 data-[active=true]:bg-secondary-600 data-[active=true]:border-secondary-600 data-[focus-visible=true]:web:ring-indicator-info',
      positive:
        'bg-success-400 border-success-400 data-[hover=true]:bg-success-300 data-[hover=true]:border-success-300 data-[active=true]:bg-success-500 data-[active=true]:border-success-500 data-[focus-visible=true]:web:ring-indicator-info',
      negative:
        'bg-error-500 border-error-500 data-[hover=true]:bg-error-400 data-[hover=true]:border-error-400 data-[active=true]:bg-error-600 data-[active=true]:border-error-600 data-[focus-visible=true]:web:ring-indicator-info',
      info: 'bg-info-500 border-info-500 data-[hover=true]:bg-info-400 data-[hover=true]:border-info-400 data-[active=true]:bg-info-600 data-[active=true]:border-info-600 data-[focus-visible=true]:web:ring-indicator-info',
      default:
        'border-typography-700 data-[hover=true]:border-typography-600 data-[active=true]:border-typography-900 data-[hover=true]:bg-background-50 data-[active=true]:bg-background-700',
    },
    variant: {
      link: 'bg-transparent px-0 data-[active=true]:bg-transparent data-[hover=true]:bg-transparent',
      outline:
        'data-[hover=true]:bg-background-50 data-[active=true]:bg-background-200 border bg-transparent',
      solid: '',
    },

    size: {
      xs: 'h-9 px-3.5',
      sm: 'h-10 px-4',
      md: 'h-11 px-5',
      lg: 'h-12 px-6',
      xl: 'h-14 px-7',
    },
  },
  compoundVariants: [
    {
      action: 'primary',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[active=true]:bg-transparent data-[hover=true]:bg-transparent',
    },
    {
      action: 'secondary',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[active=true]:bg-transparent data-[hover=true]:bg-transparent',
    },
    {
      action: 'positive',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[active=true]:bg-transparent data-[hover=true]:bg-transparent',
    },
    {
      action: 'info',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[active=true]:bg-transparent data-[hover=true]:bg-transparent',
    },
    {
      action: 'negative',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[active=true]:bg-transparent data-[hover=true]:bg-transparent',
    },
    {
      action: 'primary',
      variant: 'outline',
      class: 'data-[hover=true]:bg-primary-100 data-[active=true]:bg-primary-200 bg-transparent',
    },
    {
      action: 'secondary',
      variant: 'outline',
      class:
        'data-[hover=true]:bg-secondary-100 data-[active=true]:bg-secondary-200 bg-transparent',
    },

    {
      action: 'info',
      variant: 'outline',
      class: 'data-[hover=true]:bg-info-100 data-[active=true]:bg-info-200 bg-transparent',
    },
    {
      action: 'positive',
      variant: 'outline',
      class: 'data-[hover=true]:bg-success-100 data-[active=true]:bg-success-200 bg-transparent',
    },
    {
      action: 'negative',
      variant: 'outline',
      class: 'data-[hover=true]:bg-error-100 data-[active=true]:bg-error-200 bg-transparent',
    },
  ],
});

const buttonTextStyle = tva({
  base: 'text-typography-900 web:select-none font-JakartaSemiBold',
  parentVariants: {
    action: {
      primary:
        'text-primary-500 data-[hover=true]:text-primary-600 data-[active=true]:text-primary-700',
      secondary:
        'text-secondary-500 data-[hover=true]:text-secondary-600 data-[active=true]:text-secondary-700',
      info: 'text-info-500 data-[hover=true]:text-info-600 data-[active=true]:text-info-700',
      positive:
        'text-success-500 data-[hover=true]:text-success-600 data-[active=true]:text-success-700',
      negative: 'text-error-500 data-[hover=true]:text-error-600 data-[active=true]:text-error-700',
    },
    variant: {
      link: 'text-typography-900 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-700',
      outline:
        'text-typography-800 data-[hover=true]:text-typography-950 data-[active=true]:text-typography-950',
      solid:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
  },
  parentCompoundVariants: [
    {
      variant: 'solid',
      action: 'primary',
      class: 'text-primary-0 data-[hover=true]:text-primary-0 data-[active=true]:text-primary-0',
    },
    {
      variant: 'solid',
      action: 'secondary',
      class:
        'text-secondary-0 data-[hover=true]:text-secondary-0 data-[active=true]:text-secondary-0',
    },
    {
      variant: 'solid',
      action: 'info',
      class: 'text-info-0 data-[hover=true]:text-info-0 data-[active=true]:text-info-0',
    },
    {
      variant: 'solid',
      action: 'positive',
      class: 'text-success-0 data-[hover=true]:text-success-0 data-[active=true]:text-success-0',
    },
    {
      variant: 'solid',
      action: 'negative',
      class: 'text-error-0 data-[hover=true]:text-error-0 data-[active=true]:text-error-0',
    },
    {
      variant: 'outline',
      action: 'primary',
      class:
        'text-primary-500 data-[hover=true]:text-primary-300 data-[active=true]:text-primary-300',
    },
    {
      variant: 'outline',
      action: 'secondary',
      class:
        'text-secondary-500 data-[hover=true]:text-secondary-300 data-[active=true]:text-secondary-300',
    },
    {
      variant: 'outline',
      action: 'info',
      class: 'text-info-500 data-[hover=true]:text-info-300 data-[active=true]:text-info-300',
    },
    {
      variant: 'outline',
      action: 'positive',
      class:
        'text-success-500 data-[hover=true]:text-success-300 data-[active=true]:text-success-300',
    },
    {
      variant: 'outline',
      action: 'negative',
      class: 'text-error-500 data-[hover=true]:text-error-300 data-[active=true]:text-error-300',
    },
    {
      variant: 'link',
      action: 'primary',
      class:
        'text-primary-500 data-[hover=true]:text-primary-300 data-[active=true]:text-primary-300',
    },
    {
      variant: 'link',
      action: 'secondary',
      class:
        'text-secondary-500 data-[hover=true]:text-secondary-300 data-[active=true]:text-secondary-300',
    },
    {
      variant: 'link',
      action: 'info',
      class: 'text-info-500 data-[hover=true]:text-info-300 data-[active=true]:text-info-300',
    },
    {
      variant: 'link',
      action: 'positive',
      class:
        'text-success-500 data-[hover=true]:text-success-300 data-[active=true]:text-success-300',
    },
    {
      variant: 'link',
      action: 'negative',
      class: 'text-error-500 data-[hover=true]:text-error-300 data-[active=true]:text-error-300',
    },
  ],
});

const buttonIconStyle = tva({
  base: 'text-typography-0 data-[disabled=true]:text-typography-400 fill-none',
  parentVariants: {
    action: {
      primary:
        'text-primary-500 data-[hover=true]:text-primary-600 data-[active=true]:text-primary-700',
      secondary:
        'text-secondary-500 data-[hover=true]:text-secondary-600 data-[active=true]:text-secondary-700',
      positive:
        'text-success-500 data-[hover=true]:text-success-600 data-[active=true]:text-success-700',
      info: 'text-info-500 data-[hover=true]:text-info-600 data-[active=true]:text-info-700',
      negative: 'text-error-500 data-[hover=true]:text-error-600 data-[active=true]:text-error-700',
      default:
        'text-typography-900 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-700',
    },
    variant: {
      link: 'text-typography-900 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-700',
      outline:
        'text-typography-800 data-[hover=true]:text-typography-950 data-[active=true]:text-typography-950',
      solid:
        'text-typography-0 data-[hover=true]:text-typography-0 data-[active=true]:text-typography-0',
    },
    size: {
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-[18px] w-[18px]',
      xl: 'h-5 w-5',
    },
  },
  parentCompoundVariants: [
    {
      variant: 'solid',
      action: 'primary',
      class: 'text-primary-0 data-[hover=true]:text-primary-0 data-[active=true]:text-primary-0',
    },
    {
      variant: 'solid',
      action: 'secondary',
      class:
        'text-secondary-0 data-[hover=true]:text-secondary-0 data-[active=true]:text-secondary-0',
    },
    {
      variant: 'solid',
      action: 'positive',
      class: 'text-success-0 data-[hover=true]:text-success-0 data-[active=true]:text-success-0',
    },
    {
      variant: 'solid',
      action: 'info',
      class: 'text-info-0 data-[hover=true]:text-info-0 data-[active=true]:text-info-0',
    },
    {
      variant: 'solid',
      action: 'negative',
      class: 'text-error-0 data-[hover=true]:text-error-0 data-[active=true]:text-error-0',
    },
    {
      variant: 'outline',
      action: 'primary',
      class:
        'text-primary-500 data-[hover=true]:text-primary-800 data-[active=true]:text-primary-800',
    },
    {
      variant: 'outline',
      action: 'secondary',
      class:
        'text-secondary-500 data-[hover=true]:text-secondary-800 data-[active=true]:text-secondary-800',
    },
    {
      variant: 'outline',
      action: 'info',
      class: 'text-secondary-500 data-[hover=true]:text-info-800 data-[active=true]:text-info-800',
    },
    {
      variant: 'outline',
      action: 'positive',
      class:
        'text-success-500 data-[hover=true]:text-success-800 data-[active=true]:text-success-800',
    },
    {
      variant: 'outline',
      action: 'negative',
      class: 'text-error-500 data-[hover=true]:text-error-800 data-[active=true]:text-error-800',
    },
    {
      variant: 'link',
      action: 'primary',
      class:
        'text-primary-500 data-[hover=true]:text-primary-800 data-[active=true]:text-primary-800',
    },
    {
      variant: 'link',
      action: 'secondary',
      class:
        'text-secondary-500 data-[hover=true]:text-secondary-800 data-[active=true]:text-secondary-800',
    },
    {
      variant: 'link',
      action: 'info',
      class: 'text-info-500 data-[hover=true]:text-info-800 data-[active=true]:text-info-800',
    },
    {
      variant: 'link',
      action: 'positive',
      class:
        'text-success-500 data-[hover=true]:text-success-800 data-[active=true]:text-success-800',
    },
    {
      variant: 'link',
      action: 'negative',
      class: 'text-error-500 data-[hover=true]:text-error-800 data-[active=true]:text-error-800',
    },
  ],
});

const buttonGroupStyle = tva({
  base: '',
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
    isAttached: {
      true: 'gap-0',
    },
    flexDirection: {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
  },
});

type IButtonProps = Omit<React.ComponentPropsWithoutRef<typeof UIButton>, 'context'> &
  VariantProps<typeof buttonStyle> & { className?: string; animateOnPress?: boolean };

const Button: React.ForwardRefExoticComponent<
  IButtonProps & React.RefAttributes<React.ComponentRef<typeof UIButton>>
> = React.forwardRef<React.ComponentRef<typeof UIButton>, IButtonProps>(function Button(
  {
    className,
    variant = 'solid',
    size = 'md',
    action = 'primary',
    animateOnPress = true,
    onPressIn,
    onPressOut,
    ...props
  },
  ref
) {
  const scale = useSharedValue(1);

  const handlePressIn = (e: GestureResponderEvent) => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 200,
    });
    if (onPressIn) {
      onPressIn(e);
    }
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
    if (onPressOut) {
      onPressOut(e);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animateOnPress ? (
    <Animated.View style={animatedStyle}>
      <UIButton
        ref={ref}
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={buttonStyle({ variant, size, action, class: className })}
        context={{ variant, size, action }}
      />
    </Animated.View>
  ) : (
    <UIButton
      ref={ref}
      {...props}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      className={buttonStyle({ variant, size, action, class: className })}
      context={{ variant, size, action }}
    />
  );
});

type IButtonTextProps = React.ComponentPropsWithoutRef<typeof UIButton.Text> &
  VariantProps<typeof buttonTextStyle> & { className?: string };

const ButtonText: React.ForwardRefExoticComponent<
  IButtonTextProps & React.RefAttributes<React.ComponentRef<typeof UIButton.Text>>
> = React.forwardRef<React.ComponentRef<typeof UIButton.Text>, IButtonTextProps>(
  function ButtonText({ className, variant, size, action, ...props }, ref) {
    const {
      variant: parentVariant,
      size: parentSize,
      action: parentAction,
    } = useStyleContext(SCOPE);

    return (
      <UIButton.Text
        ref={ref}
        {...props}
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
        })}
      />
    );
  }
);

const ButtonSpinner = UIButton.Spinner;

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
  const { variant: parentVariant, size: parentSize, action: parentAction } = useStyleContext(SCOPE);

  if (typeof size === 'number') {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
        size={size}
      />
    );
  } else if ((props.height !== undefined || props.width !== undefined) && size === undefined) {
    return <UIButton.Icon ref={ref} {...props} className={buttonIconStyle({ class: className })} />;
  }
  return (
    <UIButton.Icon
      {...props}
      className={buttonIconStyle({
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
          action: parentAction,
        },
        size,
        class: className,
      })}
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
