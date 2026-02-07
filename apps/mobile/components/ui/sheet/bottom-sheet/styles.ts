import { tva } from '@gluestack-ui/nativewind-utils/tva';

const sheetTriggerStyle = tva({
  base: '',
});

const sheetContentStyle = tva({
  base: 'bg-background-0 p-5 pt-2 web:pointer-events-auto web:select-none',
});

const sheetItemStyle = tva({
  base: 'w-full flex-row items-center gap-2 rounded-sm p-3 hover:bg-background-50 active:bg-background-100 data-[focus=true]:bg-background-100 web:data-[focus-visible=true]:bg-background-100 web:data-[focus-visible=true]:outline-indicator-primary data-[disabled=true]:opacity-40 data-[disabled=true]:web:pointer-events-auto data-[disabled=true]:web:cursor-not-allowed',
});

const sheetItemTextStyle = tva({
  base: 'font-body text-typography-900',
  variants: {
    isTruncated: {
      true: '',
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
    size: {
      '2xs': 'text-2xs',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    },
  },
});

const sheetScrollViewStyle = tva({
  base: 'h-auto w-full',
});

const sheetVirtualizedListStyle = tva({
  base: 'h-auto w-full',
});

const sheetSectionListStyle = tva({
  base: 'h-auto w-full',
});

const sheetSectionHeaderTextStyle = tva({
  base: 'my-0 p-3 font-heading uppercase leading-5 text-typography-500',
  variants: {
    isTruncated: {
      true: '',
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
    size: {
      '5xl': 'text-5xl',
      '4xl': 'text-4xl',
      '3xl': 'text-3xl',
      '2xl': 'text-2xl',
      xl: 'text-xl',
      lg: 'text-lg',
      md: 'text-base',
      sm: 'text-sm',
      xs: 'text-xs',
    },

    sub: {
      true: 'text-xs',
    },
    italic: {
      true: 'italic',
    },
    highlight: {
      true: 'bg-yellow500',
    },
  },
  defaultVariants: {
    size: 'xs',
  },
});

const sheetIconStyle = tva({
  base: 'fill-none text-background-500',
  variants: {
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

export {
  sheetContentStyle,
  sheetIconStyle,
  sheetItemStyle,
  sheetItemTextStyle,
  sheetScrollViewStyle,
  sheetSectionHeaderTextStyle,
  sheetSectionListStyle,
  sheetTriggerStyle,
  sheetVirtualizedListStyle,
};
