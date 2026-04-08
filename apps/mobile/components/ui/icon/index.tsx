'use client';
import { createIcon, IPrimitiveIcon, PrimitiveIcon, Svg } from '@gluestack-ui/core/icon/creator';
import { tva, type VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import {
  ComponentPropsWithoutRef,
  ComponentRef,
  forwardRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';

export const UIIcon = createIcon({
  Root: PrimitiveIcon,
}) as ForwardRefExoticComponent<
  ComponentPropsWithoutRef<typeof PrimitiveIcon> & RefAttributes<ComponentRef<typeof Svg>>
>;

const iconStyle = tva({
  base: 'pointer-events-none text-typography-900',
  variants: {
    size: {
      '2xs': 'h-3 w-3',
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
      '2xl': 'h-8 w-8',
    },
  },
});

cssInterop(UIIcon, {
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

type IIConProps = IPrimitiveIcon &
  VariantProps<typeof iconStyle> &
  ComponentPropsWithoutRef<typeof UIIcon>;

const Icon = forwardRef<ComponentRef<typeof UIIcon>, IIConProps>(function Icon(
  { size = 'md', className, ...props },
  ref
) {
  if (typeof size === 'number') {
    return <UIIcon ref={ref} {...props} className={iconStyle({ class: className })} size={size} />;
  } else if ((props.height !== undefined || props.width !== undefined) && size === undefined) {
    return <UIIcon ref={ref} {...props} className={iconStyle({ class: className })} />;
  }
  return <UIIcon ref={ref} {...props} className={iconStyle({ size, class: className })} />;
});

export { Icon };
export type { IIConProps as IconProps };

type ParameterTypes = Omit<Parameters<typeof createIcon>[0], 'Root'>;

const createIconUI = ({ ...props }: ParameterTypes) => {
  const UIIconCreateIcon = createIcon({
    Root: Svg,
    ...props,
  }) as ForwardRefExoticComponent<
    ComponentPropsWithoutRef<typeof PrimitiveIcon> & RefAttributes<ComponentRef<typeof Svg>>
  >;

  return forwardRef<ComponentRef<typeof Svg>>(function UIIcon(
    {
      className,
      size,
      ...inComingProps
    }: VariantProps<typeof iconStyle> & ComponentPropsWithoutRef<typeof UIIconCreateIcon>,
    ref
  ) {
    return (
      <UIIconCreateIcon
        ref={ref}
        {...inComingProps}
        className={iconStyle({ size, class: className })}
      />
    );
  });
};
export { createIconUI as createIcon };
