'use client';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/icon';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { useStyleContext, withStyleContext } from '@gluestack-ui/nativewind-utils/withStyleContext';
import { cssInterop } from 'nativewind';
import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from 'react';
import { Text, View } from 'react-native';

import { Svg } from 'react-native-svg';
const SCOPE = 'BADGE';

const badgeStyle = tva({
  base: 'flex-row items-center rounded-md px-2 py-1 data-[disabled=true]:opacity-50',
  variants: {
    action: {
      error: 'border-error-300 bg-background-error',
      warning: 'border-warning-300 bg-background-warning',
      success: 'border-success-300 bg-background-success',
      info: 'border-info-300 bg-background-info',
      muted: 'border-typography-600 bg-background-muted',
      primary: 'border-primary-300 bg-primary-0',
      secondary: 'border-secondary-300 bg-secondary-0',
      tertiary: 'border-tertiary-300 bg-tertiary-50',
    },
    variant: {
      solid: '',
      outline: 'border',
    },
    size: {
      xs: 'px-1 py-0.5',
      sm: 'px-1 py-0.5',
      md: '',
      lg: '',
    },
  },
});

const badgeTextStyle = tva({
  base: 'font-body uppercase tracking-normal text-typography-700',

  parentVariants: {
    action: {
      error: 'text-error-600',
      warning: 'text-warning-600',
      success: 'text-success-600',
      info: 'text-info-600',
      muted: 'text-typography-900',
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      tertiary: 'text-tertiary-700',
    },
    size: {
      xs: 'text-[8px]',
      sm: 'text-2xs',
      md: 'text-xs',
      lg: 'text-sm',
    },
  },
  variants: {
    isTruncated: {
      true: 'web:truncate',
    },
    bold: {
      true: 'font-JakartaBold',
    },
    underline: {
      true: 'underline',
    },
    strikeThrough: {
      true: 'line-through',
    },
    sub: {
      true: 'text-xs',
    },
    italic: {
      true: 'font-JakartaItalic',
    },
    highlight: {
      true: 'bg-yellow-500',
    },
  },
});

const badgeIconStyle = tva({
  base: 'fill-none',
  parentVariants: {
    action: {
      error: 'text-error-600',
      warning: 'text-warning-600',
      success: 'text-success-600',
      info: 'text-info-600',
      muted: 'text-typography-800',
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      tertiary: 'text-tertiary-700',
    },
    size: {
      xs: 'h-2 w-2',
      sm: 'h-3 w-3',
      md: 'h-3.5 w-3.5',
      lg: 'h-4 w-4',
    },
  },
});

const ContextView = withStyleContext(View, SCOPE);

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

type IBadgeProps = ComponentPropsWithoutRef<typeof ContextView> & VariantProps<typeof badgeStyle>;
function Badge({
  children,
  action = 'muted',
  variant = 'solid',
  size = 'md',
  className,
  ...props
}: { className?: string } & IBadgeProps) {
  return (
    <ContextView
      className={badgeStyle({ action, variant, class: className })}
      {...props}
      context={{
        action,
        variant,
        size,
      }}
    >
      {children}
    </ContextView>
  );
}

type IBadgeTextProps = ComponentPropsWithoutRef<typeof Text> & VariantProps<typeof badgeTextStyle>;

const BadgeText = forwardRef<ComponentRef<typeof Text>, IBadgeTextProps>(function BadgeText(
  { children, className, size, ...props },
  ref
) {
  const { size: parentSize, action: parentAction } = useStyleContext(SCOPE);
  return (
    <Text
      ref={ref}
      className={badgeTextStyle({
        parentVariants: {
          size: parentSize,
          action: parentAction,
        },
        size,
        class: className,
      })}
      {...props}
    >
      {children}
    </Text>
  );
});

type IBadgeIconProps = ComponentPropsWithoutRef<typeof PrimitiveIcon> &
  VariantProps<typeof badgeIconStyle>;

const BadgeIcon = forwardRef<ComponentRef<typeof Svg>, IBadgeIconProps>(function BadgeIcon(
  { className, size, ...props },
  ref
) {
  const { size: parentSize, action: parentAction } = useStyleContext(SCOPE);

  if (typeof size === 'number') {
    return (
      <UIIcon ref={ref} {...props} className={badgeIconStyle({ class: className })} size={size} />
    );
  } else if ((props?.height !== undefined || props?.width !== undefined) && size === undefined) {
    return <UIIcon ref={ref} {...props} className={badgeIconStyle({ class: className })} />;
  }
  return (
    <UIIcon
      className={badgeIconStyle({
        parentVariants: {
          size: parentSize,
          action: parentAction,
        },
        size,
        class: className,
      })}
      {...props}
      ref={ref}
    />
  );
});

Badge.displayName = 'Badge';
BadgeText.displayName = 'BadgeText';
BadgeIcon.displayName = 'BadgeIcon';

export { Badge, BadgeIcon, BadgeText };
