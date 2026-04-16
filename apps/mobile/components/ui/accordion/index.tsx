'use client';
import { createAccordion } from '@gluestack-ui/core/accordion/creator';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { tva, useStyleContext, withStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { Platform, Pressable, Text, TextProps, View } from 'react-native';

import { H3 } from '@expo/html-elements';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator';
import { cssInterop } from 'nativewind';
import {
  ComponentPropsWithoutRef,
  ComponentRef,
  ComponentType,
  ElementType,
  forwardRef,
} from 'react';

const SCOPE = 'ACCORDION';
/** Styles */

const accordionStyle = tva({
  base: 'w-full',
  variants: {
    variant: {
      filled: 'bg-background-0 shadow-hard-2',
      unfilled: '',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
});

const accordionItemStyle = tva({
  base: '',
  parentVariants: {
    variant: {
      filled: 'bg-background-0',
      unfilled: 'bg-transparent',
    },
  },
});
const accordionTitleTextStyle = tva({
  base: 'flex-1 text-left font-JakartaBold text-typography-900',
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
});
const accordionIconStyle = tva({
  base: 'fill-none text-typography-900',
  parentVariants: {
    size: {
      '2xs': 'h-3 w-3',
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    },
  },
});
const accordionContentTextStyle = tva({
  base: 'font-sans text-typography-700',
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
});
const accordionHeaderStyle = tva({
  base: 'mx-0 my-0',
});
const accordionContentStyle = tva({
  base: 'px-4 pb-3 pt-1',
});
const accordionTriggerStyle = tva({
  base: 'w-full flex-row items-center justify-between px-4 py-3 focus:outline-none web:outline-none data-[focus-visible=true]:bg-background-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40',
});

const Root = withStyleContext(View, SCOPE);

const Header = (Platform.OS === 'web' ? H3 : View) as ComponentType<TextProps>;

/** Creator */
const UIAccordion = createAccordion({
  Root: Root,
  Item: View,
  Header: Header,
  Trigger: Pressable,
  Icon: UIIcon,
  TitleText: Text,
  ContentText: Text,
  Content: View,
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

cssInterop(H3, {
  className: {
    target: 'style',
  },
});

type IAccordionProps = ComponentPropsWithoutRef<typeof UIAccordion> &
  VariantProps<typeof accordionStyle>;

type IAccordionItemProps = ComponentPropsWithoutRef<typeof UIAccordion.Item> &
  VariantProps<typeof accordionItemStyle>;

type IAccordionContentProps = ComponentPropsWithoutRef<typeof UIAccordion.Content> &
  VariantProps<typeof accordionContentStyle>;

type IAccordionContentTextProps = ComponentPropsWithoutRef<typeof UIAccordion.ContentText> &
  VariantProps<typeof accordionContentTextStyle>;

type IAccordionIconProps = VariantProps<typeof accordionIconStyle> &
  ComponentPropsWithoutRef<typeof UIAccordion.Icon> & {
    as?: ElementType;
    height?: number;
    width?: number;
  };

type IAccordionHeaderProps = ComponentPropsWithoutRef<typeof UIAccordion.Header> &
  VariantProps<typeof accordionHeaderStyle>;

type IAccordionTriggerProps = ComponentPropsWithoutRef<typeof UIAccordion.Trigger> &
  VariantProps<typeof accordionTriggerStyle>;

type IAccordionTitleTextProps = ComponentPropsWithoutRef<typeof UIAccordion.TitleText> &
  VariantProps<typeof accordionTitleTextStyle>;

/** Components */

const Accordion = forwardRef<ComponentRef<typeof UIAccordion>, IAccordionProps>(
  ({ className, variant = 'filled', size = 'md', ...props }, ref) => {
    return (
      <UIAccordion
        ref={ref}
        {...props}
        className={accordionStyle({ variant, class: className })}
        context={{ variant, size }}
      />
    );
  }
);

const AccordionItem = forwardRef<ComponentRef<typeof UIAccordion.Item>, IAccordionItemProps>(
  ({ className, ...props }, ref) => {
    const { variant } = useStyleContext(SCOPE);
    return (
      <UIAccordion.Item
        ref={ref}
        {...props}
        className={accordionItemStyle({
          parentVariants: { variant },
          class: className,
        })}
      />
    );
  }
);

const AccordionContent = forwardRef<
  ComponentRef<typeof UIAccordion.Content>,
  IAccordionContentProps
>(function AccordionContent({ className, ...props }, ref) {
  return (
    <UIAccordion.Content
      ref={ref}
      {...props}
      className={accordionContentStyle({
        class: className,
      })}
    />
  );
});

const AccordionContentText = forwardRef<
  ComponentRef<typeof UIAccordion.ContentText>,
  IAccordionContentTextProps
>(function AccordionContentText({ className, ...props }, ref) {
  const { size } = useStyleContext(SCOPE);
  return (
    <UIAccordion.ContentText
      ref={ref}
      {...props}
      className={accordionContentTextStyle({
        parentVariants: { size },
        class: className,
      })}
    />
  );
});

const AccordionIcon = forwardRef<ComponentRef<typeof UIAccordion.Icon>, IAccordionIconProps>(
  function AccordionIcon({ size, className, ...props }, ref) {
    const { size: parentSize } = useStyleContext(SCOPE);

    if (typeof size === 'number') {
      return (
        <UIAccordion.Icon
          ref={ref}
          {...props}
          className={accordionIconStyle({ class: className })}
          size={size}
        />
      );
    } else if ((props.height !== undefined || props.width !== undefined) && size === undefined) {
      return (
        <UIAccordion.Icon
          ref={ref}
          {...props}
          className={accordionIconStyle({ class: className })}
        />
      );
    }
    return (
      <UIAccordion.Icon
        ref={ref}
        {...props}
        className={accordionIconStyle({
          size,
          class: className,
          parentVariants: { size: parentSize },
        })}
      />
    );
  }
);

const AccordionHeader = forwardRef<ComponentRef<typeof UIAccordion.Header>, IAccordionHeaderProps>(
  function AccordionHeader({ className, ...props }, ref) {
    return (
      <UIAccordion.Header
        ref={ref}
        {...props}
        className={accordionHeaderStyle({
          class: className,
        })}
      />
    );
  }
);

const AccordionTrigger = forwardRef<
  ComponentRef<typeof UIAccordion.Trigger>,
  IAccordionTriggerProps
>(function AccordionTrigger({ className, ...props }, ref) {
  return (
    <UIAccordion.Trigger
      ref={ref}
      {...props}
      className={accordionTriggerStyle({
        class: className,
      })}
    />
  );
});
const AccordionTitleText = forwardRef<
  ComponentRef<typeof UIAccordion.TitleText>,
  IAccordionTitleTextProps
>(function AccordionTitleText({ className, ...props }, ref) {
  const { size } = useStyleContext(SCOPE);
  return (
    <UIAccordion.TitleText
      ref={ref}
      {...props}
      className={accordionTitleTextStyle({
        parentVariants: { size },
        class: className,
      })}
    />
  );
});

Accordion.displayName = 'Accordion';
AccordionItem.displayName = 'AccordionItem';
AccordionHeader.displayName = 'AccordionHeader';
AccordionTrigger.displayName = 'AccordionTrigger';
AccordionTitleText.displayName = 'AccordionTitleText';
AccordionContentText.displayName = 'AccordionContentText';
AccordionIcon.displayName = 'AccordionIcon';
AccordionContent.displayName = 'AccordionContent';

export {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
};
