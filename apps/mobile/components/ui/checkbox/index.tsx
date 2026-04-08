'use client';
import { createCheckbox } from '@gluestack-ui/checkbox';
import { IPrimitiveIcon, PrimitiveIcon, UIIcon } from '@gluestack-ui/core';
import {
  tva,
  useStyleContext,
  VariantProps,
  withStyleContext,
} from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from 'react';
import type { TextProps, ViewProps } from 'react-native';
import { Platform, Pressable, Text, View } from 'react-native';

const IndicatorWrapper = forwardRef<ComponentRef<typeof View>, ViewProps>(function IndicatorWrapper(
  { ...props },
  ref
) {
  return <View {...props} ref={ref} />;
});

const LabelWrapper = forwardRef<ComponentRef<typeof Text>, TextProps>(function LabelWrapper(
  { ...props },
  ref
) {
  return <Text {...props} ref={ref} />;
});

const IconWrapper = forwardRef<ComponentRef<typeof PrimitiveIcon>, IPrimitiveIcon>(
  function IconWrapper({ ...props }, ref) {
    return <UIIcon {...props} ref={ref} />;
  }
);

const SCOPE = 'CHECKBOX';
const UICheckbox = createCheckbox({
  // @ts-expect-error : internal implementation for r-19/react-native-web
  Root: Platform.OS === 'web' ? withStyleContext(View, SCOPE) : withStyleContext(Pressable, SCOPE),
  Group: View,
  Icon: IconWrapper,
  Label: LabelWrapper,
  Indicator: IndicatorWrapper,
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

const checkboxStyle = tva({
  base: 'group/checkbox flex-row items-center justify-start web:cursor-pointer data-[disabled=true]:cursor-not-allowed',
  variants: {
    size: {
      lg: 'gap-2',
      md: 'gap-2',
      sm: 'gap-1.5',
    },
  },
});

const checkboxIndicatorStyle = tva({
  base: 'items-center justify-center rounded border-outline-400 bg-transparent data-[checked=true]:border-primary-600 data-[checked=true]:bg-primary-600 data-[invalid=true]:border-error-700 web:data-[focus-visible=true]:outline-none web:data-[focus-visible=true]:ring-2 web:data-[focus-visible=true]:ring-indicator-primary data-[hover=true]:data-[checked=false]:border-outline-500 data-[hover=true]:data-[checked=true]:bg-primary-700 data-[hover=true]:data-[checked=true]:border-primary-700 data-[hover=true]:data-[checked=true]:data-[disabled=true]:bg-primary-600 data-[hover=true]:data-[checked=true]:data-[disabled=true]:border-primary-600 data-[hover=true]:data-[checked=true]:data-[disabled=true]:data-[invalid=true]:border-error-700 data-[hover=true]:data-[checked=true]:data-[disabled=true]:opacity-40 data-[hover=true]:data-[invalid=true]:border-error-700 data-[hover=true]:bg-transparent data-[hover=true]:data-[disabled=true]:data-[invalid=true]:border-error-700 data-[hover=true]:data-[disabled=true]:border-outline-400 data-[active=true]:data-[checked=true]:bg-primary-800 data-[active=true]:data-[checked=true]:border-primary-800 data-[disabled=true]:opacity-40',
  parentVariants: {
    size: {
      lg: 'h-6 w-6 border-[3px]',
      md: 'h-5 w-5 border-2',
      sm: 'h-4 w-4 border-2',
    },
  },
});

const checkboxLabelStyle = tva({
  base: 'font-sans text-typography-600 web:select-none data-[checked=true]:text-typography-900 data-[hover=true]:data-[checked=true]:data-[disabled=true]:text-typography-900 data-[hover=true]:data-[checked=true]:text-typography-900 data-[hover=true]:text-typography-900 data-[hover=true]:data-[disabled=true]:text-typography-400 data-[active=true]:data-[checked=true]:text-typography-900 data-[active=true]:text-typography-900 data-[disabled=true]:opacity-40',
  parentVariants: {
    size: {
      lg: 'text-lg',
      md: 'text-base',
      sm: 'text-sm',
    },
  },
});

const checkboxIconStyle = tva({
  base: 'fill-none text-typography-50',

  parentVariants: {
    size: {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
});

const CheckboxGroup = UICheckbox.Group;

type ICheckboxProps = ComponentPropsWithoutRef<typeof UICheckbox> &
  VariantProps<typeof checkboxStyle>;

const Checkbox = forwardRef<ComponentRef<typeof UICheckbox>, ICheckboxProps>(function Checkbox(
  { className, size = 'md', ...props },
  ref
) {
  return (
    <UICheckbox
      className={checkboxStyle({
        class: className,
        size,
      })}
      {...props}
      context={{
        size,
      }}
      ref={ref}
    />
  );
});

type ICheckboxIndicatorProps = ComponentPropsWithoutRef<typeof UICheckbox.Indicator> &
  VariantProps<typeof checkboxIndicatorStyle>;

const CheckboxIndicator = forwardRef<
  ComponentRef<typeof UICheckbox.Indicator>,
  ICheckboxIndicatorProps
>(function CheckboxIndicator({ className, ...props }, ref) {
  const { size: parentSize } = useStyleContext(SCOPE);

  return (
    <UICheckbox.Indicator
      className={checkboxIndicatorStyle({
        parentVariants: {
          size: parentSize,
        },
        class: className,
      })}
      {...props}
      ref={ref}
    />
  );
});

type ICheckboxLabelProps = ComponentPropsWithoutRef<typeof UICheckbox.Label> &
  VariantProps<typeof checkboxLabelStyle>;
const CheckboxLabel = forwardRef<ComponentRef<typeof UICheckbox.Label>, ICheckboxLabelProps>(
  function CheckboxLabel({ className, ...props }, ref) {
    const { size: parentSize } = useStyleContext(SCOPE);
    return (
      <UICheckbox.Label
        className={checkboxLabelStyle({
          parentVariants: {
            size: parentSize,
          },
          class: className,
        })}
        {...props}
        ref={ref}
      />
    );
  }
);

type ICheckboxIconProps = ComponentPropsWithoutRef<typeof UICheckbox.Icon> &
  VariantProps<typeof checkboxIconStyle>;

const CheckboxIcon = forwardRef<ComponentRef<typeof UICheckbox.Icon>, ICheckboxIconProps>(
  function CheckboxIcon({ className, size, ...props }, ref) {
    const { size: parentSize } = useStyleContext(SCOPE);

    if (typeof size === 'number') {
      return (
        <UICheckbox.Icon
          ref={ref}
          {...props}
          className={checkboxIconStyle({ class: className })}
          size={size}
        />
      );
    } else if ((props.height !== undefined || props.width !== undefined) && size === undefined) {
      return (
        <UICheckbox.Icon ref={ref} {...props} className={checkboxIconStyle({ class: className })} />
      );
    }

    return (
      <UICheckbox.Icon
        className={checkboxIconStyle({
          parentVariants: {
            size: parentSize,
          },
          class: className,
          size,
        })}
        {...props}
        ref={ref}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';
CheckboxIndicator.displayName = 'CheckboxIndicator';
CheckboxLabel.displayName = 'CheckboxLabel';
CheckboxIcon.displayName = 'CheckboxIcon';

export { Checkbox, CheckboxGroup, CheckboxIcon, CheckboxIndicator, CheckboxLabel };
export type {
  ICheckboxIconProps as CheckboxIconProps,
  ICheckboxIndicatorProps as CheckboxIndicatorProps,
  ICheckboxLabelProps as CheckboxLabelProps,
  ICheckboxProps as CheckboxProps,
};
