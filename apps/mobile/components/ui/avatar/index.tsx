'use client';
import { addAuthHeadersInImageSource } from '@/lib/utils/addAuthHeadersInImageSource';
import { createAvatar } from '@gluestack-ui/core/avatar/creator';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { tva, useStyleContext, withStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { Image as ExpoImage } from 'expo-image';
import { UserIcon } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from 'react';
import { Platform, Text, View } from 'react-native';
import { Icon, IconProps } from '../icon';

const StyledImage = cssInterop(ExpoImage, { className: 'style' });

const SCOPE = 'AVATAR';

const UIAvatar = createAvatar({
  Root: withStyleContext(View, SCOPE),
  Badge: View,
  Group: View,
  Image: StyledImage,
  FallbackText: Text,
});

const avatarStyle = tva({
  base: 'relative items-center justify-center rounded-full border-primary-500 bg-primary-500 group-[.avatar-group]/avatar-group:-ml-2.5',
  variants: {
    size: {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16',
      xl: 'h-24 w-24',
      '2xl': 'h-32 w-32',
    },
    status: {
      online: '',
      offline: '',
      away: '',
    },
    action: {
      primary: 'bg-primary-500',
      muted: 'bg-background-100',
      default: 'bg-typography-900',
    },
  },
});

const avatarFallbackTextStyle = tva({
  base: 'text-transform:uppercase overflow-hidden font-semibold text-typography-0 web:cursor-default',
  parentVariants: {
    size: {
      xs: 'text-2xs',
      sm: 'text-xs',
      md: 'text-base',
      lg: 'text-xl',
      xl: 'text-3xl',
      '2xl': 'text-5xl',
    },
    action: {
      primary: 'text-primary-0',
      muted: 'text-typography-400',
      default: 'text-typography-0',
    },
  },
});

const avatarFallbackIconStyle = tva({
  base: '',
  parentVariants: {
    action: {
      primary: 'text-primary-0',
      muted: 'text-typography-400',
      default: 'text-typography-0',
    },
    size: {
      xs: 'h-4 w-4',
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
      '2xl': 'h-24 w-24',
    },
  },
});

const avatarGroupStyle = tva({
  base: 'group/avatar-group avatar-group relative flex-row-reverse',
});

const avatarBadgeStyle = tva({
  base: 'absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-background-0 bg-success-400',
  parentVariants: {
    size: {
      xs: 'h-2 w-2',
      sm: 'h-2 w-2',
      md: 'h-3 w-3',
      lg: 'h-4 w-4',
      xl: 'h-6 w-6',
      '2xl': 'h-8 w-8',
    },
    status: {
      online: 'bg-success-400',
      offline: 'bg-background-300',
      away: 'bg-warning-500',
    },
  },
});

const avatarImageStyle = tva({
  base: 'absolute h-full w-full rounded-full',
});

type IAvatarProps = Omit<ComponentPropsWithoutRef<typeof UIAvatar>, 'context'> &
  VariantProps<typeof avatarStyle>;

const Avatar = forwardRef<ComponentRef<typeof UIAvatar>, IAvatarProps>(function Avatar(
  { className, size = 'md', status = 'online', action = 'primary', ...props },
  ref
) {
  return (
    <UIAvatar
      ref={ref}
      {...props}
      className={avatarStyle({ size, class: className, action })}
      context={{ size, status, action }}
    />
  );
});

type IAvatarBadgeProps = ComponentPropsWithoutRef<typeof UIAvatar.Badge> &
  VariantProps<typeof avatarBadgeStyle>;

const AvatarBadge = forwardRef<ComponentRef<typeof UIAvatar.Badge>, IAvatarBadgeProps>(
  function AvatarBadge({ className, size, status = 'online', ...props }, ref) {
    const { size: parentSize, status: parentStatus } = useStyleContext(SCOPE);

    return (
      <UIAvatar.Badge
        ref={ref}
        {...props}
        className={avatarBadgeStyle({
          parentVariants: {
            size: parentSize,
            status: parentStatus,
          },
          size,
          status,
          class: className,
        })}
      />
    );
  }
);

type IAvatarFallbackTextProps = ComponentPropsWithoutRef<typeof UIAvatar.FallbackText> &
  VariantProps<typeof avatarFallbackTextStyle>;
const AvatarFallbackText = forwardRef<
  ComponentRef<typeof UIAvatar.FallbackText>,
  IAvatarFallbackTextProps
>(function AvatarFallbackText({ className, size, ...props }, ref) {
  const { size: parentSize, action: parentAction } = useStyleContext(SCOPE);

  return (
    <UIAvatar.FallbackText
      ref={ref}
      {...props}
      className={avatarFallbackTextStyle({
        parentVariants: {
          size: parentSize,
          action: parentAction,
        },
        size,
        class: className,
      })}
    />
  );
});

type IAvatarFallbackIconProps = IconProps &
  Omit<VariantProps<typeof avatarFallbackIconStyle>, 'size'>;
const AvatarFallbackIcon = forwardRef<ComponentRef<typeof Icon>, IAvatarFallbackIconProps>(
  function AvatarFallbackIcon({ className, as = UserIcon, ...props }, ref) {
    const { size: parentSize, action: parentAction } = useStyleContext(SCOPE);

    return (
      <Icon
        {...props}
        ref={ref}
        as={as}
        className={avatarFallbackIconStyle({
          className: className,
          parentVariants: { action: parentAction, size: parentSize },
        })}
      />
    );
  }
);

type IAvatarImageProps = ComponentPropsWithoutRef<typeof UIAvatar.Image> &
  VariantProps<typeof avatarImageStyle>;

const AvatarImage = forwardRef<ComponentRef<typeof UIAvatar.Image>, IAvatarImageProps>(
  function AvatarImage({ className, source, ...props }, ref) {
    const newSource = addAuthHeadersInImageSource(source);

    return (
      <UIAvatar.Image
        ref={ref}
        {...props}
        source={newSource}
        className={avatarImageStyle({ class: className })}
        // @ts-expect-error : This is a workaround to fix the issue with the image style on web.
        style={Platform.select({
          web: { height: 'revert-layer', width: 'revert-layer' },
          default: { height: '100%', width: '100%' },
        })}
      />
    );
  }
);

type IAvatarGroupProps = ComponentPropsWithoutRef<typeof UIAvatar.Group> &
  VariantProps<typeof avatarGroupStyle>;

const AvatarGroup = forwardRef<ComponentRef<typeof UIAvatar.Group>, IAvatarGroupProps>(
  function AvatarGroup({ className, ...props }, ref) {
    return (
      <UIAvatar.Group
        ref={ref}
        {...props}
        className={avatarGroupStyle({
          class: className,
        })}
      />
    );
  }
);

export { Avatar, AvatarBadge, AvatarFallbackIcon, AvatarFallbackText, AvatarGroup, AvatarImage };
export type {
  IAvatarBadgeProps as AvatarBadgeProps,
  IAvatarFallbackIconProps as AvatarFallbackIconProps,
  IAvatarFallbackTextProps as AvatarFallbackTextProps,
  IAvatarGroupProps as AvatarGroupProps,
  IAvatarImageProps as AvatarImageProps,
  IAvatarProps as AvatarProps,
};
