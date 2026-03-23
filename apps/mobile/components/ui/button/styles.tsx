import { tva } from '@gluestack-ui/utils/nativewind-utils';

const buttonStyle = tva({
  base: 'group/button flex-row items-center justify-center gap-2 overflow-hidden rounded-xl disabled:opacity-50 focus:web:outline-none focus:web:ring-2',
  variants: {
    action: {
      primary:
        'border-primary-500 bg-primary-500 hover:border-primary-500 hover:bg-primary-400 active:border-primary-600 active:bg-primary-600 focus:web:ring-indicator-info',
      secondary:
        'border-secondary-500 bg-secondary-500 hover:border-secondary-400 hover:bg-secondary-400 active:border-secondary-600 active:bg-secondary-600 focus:web:ring-indicator-info',
      tertiary:
        'border-tertiary-500 bg-tertiary-500 hover:border-tertiary-400 hover:bg-tertiary-400 active:border-tertiary-600 active:bg-tertiary-600 focus:web:ring-indicator-info',
      positive:
        'border-success-400 bg-success-400 hover:border-success-300 hover:bg-success-300 active:border-success-500 active:bg-success-500 focus:web:ring-indicator-info',
      negative:
        'border-error-500 bg-error-500 hover:border-error-400 hover:bg-error-400 active:border-error-600 active:bg-error-600 focus:web:ring-indicator-info',
      info: 'border-info-500 bg-info-500 hover:border-info-400 hover:bg-info-400 active:border-info-600 active:bg-info-600 focus:web:ring-indicator-info',
      muted:
        'border-outline-400 bg-background-0 hover:border-outline-300 hover:bg-background-100 active:border-outline-300 active:bg-background-100',
      default:
        'border-typography-950 bg-typography-950 hover:border-typography-600 hover:bg-typography-600 active:border-typography-600 active:bg-typography-600',
    },
    variant: {
      link: 'overflow-auto rounded-none bg-transparent px-0 hover:bg-transparent active:bg-transparent',
      outline: 'border bg-transparent hover:bg-background-50 active:bg-background-50',
      ghost: 'bg-transparent hover:bg-background-50 active:bg-background-50',
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
      variant: 'outline',
      class: 'bg-transparent hover:bg-primary-50 active:bg-primary-0',
    },
    {
      action: 'secondary',
      variant: 'outline',
      class: 'bg-transparent hover:bg-secondary-50 active:bg-secondary-0',
    },
    {
      action: 'tertiary',
      variant: 'outline',
      class: 'bg-transparent hover:bg-tertiary-50 active:bg-tertiary-0',
    },
    {
      action: 'info',
      variant: 'outline',
      class: 'bg-transparent hover:bg-info-50 active:bg-info-0',
    },
    {
      action: 'positive',
      variant: 'outline',
      class: 'bg-transparent hover:bg-success-50 active:bg-success-0',
    },
    {
      action: 'negative',
      variant: 'outline',
      class: 'bg-transparent hover:bg-error-50 active:bg-error-0',
    },
    {
      action: 'primary',
      variant: 'ghost',
      class: 'bg-transparent hover:bg-primary-50 active:bg-primary-0',
    },
    {
      action: 'secondary',
      variant: 'ghost',
      class: 'bg-transparent hover:bg-secondary-50 active:bg-secondary-0',
    },
    {
      action: 'tertiary',
      variant: 'ghost',
      class: 'bg-transparent hover:bg-tertiary-50 active:bg-tertiary-0',
    },
    {
      action: 'info',
      variant: 'ghost',
      class: 'bg-transparent hover:bg-info-50 active:bg-info-0',
    },
    {
      action: 'positive',
      variant: 'ghost',
      class: 'bg-transparent hover:bg-success-50 active:bg-success-0',
    },
    {
      action: 'negative',
      variant: 'ghost',
      class: 'bg-transparent hover:bg-error-50 active:bg-error-0',
    },
  ],
});

const buttonTextStyle = tva({
  base: 'font-JakartaSemiBold text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-700',
  variants: {
    underlineOnPress: { true: '' },
  },
  parentVariants: {
    action: {
      primary:
        'text-primary-500 group-hover/button:text-primary-400 group-active/button:text-primary-400',
      secondary:
        'text-secondary-500 group-hover/button:text-secondary-400 group-active/button:text-secondary-400',
      tertiary:
        'text-tertiary-500 group-hover/button:text-tertiary-400 group-active/button:text-tertiary-400',
      info: 'text-info-500 group-hover/button:text-info-400 group-active/button:text-info-400',
      positive:
        'text-success-500 group-hover/button:text-success-400 group-active/button:text-success-400',
      negative:
        'text-error-500 group-hover/button:text-error-400 group-active/button:text-error-400',
      muted: '',
    },
    variant: {
      link: 'group-hover/button:underline group-active/button:underline',
      outline: '',
      ghost: '',
      solid:
        'text-typography-0 group-hover/button:text-typography-0 group-active/button:text-typography-0',
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
      class: 'text-primary-0 group-hover/button:text-primary-0 group-active/button:text-primary-0',
    },
    {
      variant: 'solid',
      action: 'secondary',
      class:
        'text-secondary-0 group-hover/button:text-secondary-0 group-active/button:text-secondary-0',
    },
    {
      variant: 'solid',
      action: 'tertiary',
      class:
        'text-tertiary-0 group-hover/button:text-tertiary-0 group-active/button:text-tertiary-0',
    },
    {
      variant: 'solid',
      action: 'info',
      class: 'text-info-0 group-hover/button:text-info-0 group-active/button:text-info-0',
    },
    {
      variant: 'solid',
      action: 'positive',
      class: 'text-success-0 group-hover/button:text-success-0 group-active/button:text-success-0',
    },
    {
      variant: 'solid',
      action: 'negative',
      class: 'text-error-0 group-hover/button:text-error-0 group-active/button:text-error-0',
    },
    {
      variant: 'solid',
      action: 'muted',
      class:
        'text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-700',
    },
  ],
});

const buttonIconStyle = tva({
  base: 'fill-none text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-700',
  parentVariants: {
    action: {
      primary:
        'text-primary-500 group-hover/button:text-primary-400 group-active/button:text-primary-400',
      secondary:
        'text-secondary-500 group-hover/button:text-secondary-400 group-active/button:text-secondary-400',
      tertiary:
        'text-tertiary-500 group-hover/button:text-tertiary-400 group-active/button:text-tertiary-400',
      info: 'text-info-500 group-hover/button:text-info-400 group-active/button:text-info-400',
      positive:
        'text-success-500 group-hover/button:text-success-400 group-active/button:text-success-400',
      negative:
        'text-error-500 group-hover/button:text-error-400 group-active/button:text-error-400',
      muted: '',
    },
    variant: {
      link: 'group-hover/button:underline group-focus-visible/button:underline group-active/button:underline',
      outline: '',
      ghost: '',
      solid:
        'text-typography-0 group-hover/button:text-typography-0 group-active/button:text-typography-0',
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
      class: 'text-primary-0 group-hover/button:text-primary-0 group-active/button:text-primary-0',
    },
    {
      variant: 'solid',
      action: 'secondary',
      class:
        'text-secondary-0 group-hover/button:text-secondary-0 group-active/button:text-secondary-0',
    },
    {
      variant: 'solid',
      action: 'tertiary',
      class:
        'text-tertiary-0 group-hover/button:text-tertiary-0 group-active/button:text-tertiary-0',
    },
    {
      variant: 'solid',
      action: 'positive',
      class: 'text-success-0 group-hover/button:text-success-0 group-active/button:text-success-0',
    },
    {
      variant: 'solid',
      action: 'info',
      class: 'text-info-0 group-hover/button:text-info-0 group-active/button:text-info-0',
    },
    {
      variant: 'solid',
      action: 'negative',
      class: 'text-error-0 group-hover/button:text-error-0 group-active/button:text-error-0',
    },
    {
      variant: 'solid',
      action: 'muted',
      class:
        'text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-700',
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

export { buttonGroupStyle, buttonIconStyle, buttonStyle, buttonTextStyle };
