import { tva } from '@gluestack-ui/nativewind-utils/tva';

const buttonStyle = tva({
  base: 'group/button flex-row items-center justify-center gap-2 overflow-hidden rounded-xl bg-typography-900 disabled:opacity-50 focus:web:outline-none focus:web:ring-2',
  variants: {
    action: {
      primary:
        'border-primary-400 bg-primary-500 hover:border-primary-500 hover:bg-primary-400 active:border-primary-600 active:bg-primary-600 focus:web:ring-indicator-info',
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
        'border-typography-900 hover:border-typography-300 hover:bg-typography-300 active:border-typography-600 active:bg-typography-600',
    },
    variant: {
      link: 'bg-transparent px-0 hover:bg-transparent active:bg-transparent',
      outline: 'border bg-transparent hover:bg-background-50 active:bg-background-100',
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
      class: 'bg-transparent px-0 hover:bg-transparent active:bg-transparent',
    },
    {
      action: 'secondary',
      variant: 'link',
      class: 'bg-transparent px-0 hover:bg-transparent active:bg-transparent',
    },
    {
      action: 'tertiary',
      variant: 'link',
      class: 'bg-transparent px-0 hover:bg-transparent active:bg-transparent',
    },
    {
      action: 'positive',
      variant: 'link',
      class: 'bg-transparent px-0 hover:bg-transparent active:bg-transparent',
    },
    {
      action: 'info',
      variant: 'link',
      class: 'bg-transparent px-0 hover:bg-transparent active:bg-transparent',
    },
    {
      action: 'negative',
      variant: 'link',
      class: 'bg-transparent px-0 hover:bg-transparent active:bg-transparent',
    },
    {
      action: 'primary',
      variant: 'outline',
      class: 'bg-transparent hover:bg-primary-100 active:bg-primary-200',
    },
    {
      action: 'secondary',
      variant: 'outline',
      class: 'bg-transparent hover:bg-secondary-100 active:bg-secondary-200',
    },
    {
      action: 'tertiary',
      variant: 'outline',
      class: 'bg-transparent hover:bg-tertiary-100 active:bg-tertiary-200',
    },
    {
      action: 'info',
      variant: 'outline',
      class: 'bg-transparent hover:bg-info-100 active:bg-info-200',
    },
    {
      action: 'positive',
      variant: 'outline',
      class: 'bg-transparent hover:bg-success-100 active:bg-success-200',
    },
    {
      action: 'negative',
      variant: 'outline',
      class: 'bg-transparent hover:bg-error-100 active:bg-error-200',
    },
  ],
});

const buttonTextStyle = tva({
  base: 'font-JakartaSemiBold text-typography-0',
  variants: {
    underlineOnPress: { true: 'group-active/button:underline' },
  },
  parentVariants: {
    action: {
      primary:
        'text-primary-500 group-hover/button:text-primary-600 group-active/button:text-primary-700',
      secondary:
        'text-secondary-500 group-hover/button:text-secondary-600 group-active/button:text-secondary-700',
      tertiary:
        'text-tertiary-500 group-hover/button:text-tertiary-600 group-active/button:text-tertiary-700',
      info: 'text-info-500 group-hover/button:text-info-600 group-active/button:text-info-700',
      positive:
        'text-success-500 group-hover/button:text-success-600 group-active/button:text-success-700',
      negative:
        'text-error-500 group-hover/button:text-error-600 group-active/button:text-error-700',
      muted:
        'text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-700',
    },
    variant: {
      link: 'text-typography-950 group-hover/button:text-typography-800 group-active/button:text-typography-700',
      outline:
        'text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-800',
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
      class:
        'text-primary-0 group-hover/button:text-primary-0 group-active/button:text-primary-100',
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
    {
      variant: 'outline',
      action: 'primary',
      class:
        'text-primary-500 group-hover/button:text-primary-600 group-active/button:text-primary-600',
    },
    {
      variant: 'outline',
      action: 'secondary',
      class:
        'text-secondary-500 group-hover/button:text-secondary-600 group-active/button:text-secondary-600',
    },
    {
      variant: 'outline',
      action: 'tertiary',
      class:
        'text-tertiary-500 group-hover/button:text-tertiary-600 group-active/button:text-tertiary-600',
    },
    {
      variant: 'outline',
      action: 'info',
      class: 'text-info-500 group-hover/button:text-info-600 group-active/button:text-info-600',
    },
    {
      variant: 'outline',
      action: 'positive',
      class:
        'text-success-500 group-hover/button:text-success-600 group-active/button:text-success-600',
    },
    {
      variant: 'outline',
      action: 'negative',
      class: 'text-error-500 group-hover/button:text-error-600 group-active/button:text-error-600',
    },
    {
      variant: 'outline',
      action: 'muted',
      class:
        'text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-700',
    },
    {
      variant: 'link',
      action: 'primary',
      class:
        'text-primary-500 group-hover/button:text-primary-300 group-active/button:text-primary-300',
    },
    {
      variant: 'link',
      action: 'secondary',
      class:
        'text-secondary-500 group-hover/button:text-secondary-300 group-active/button:text-secondary-300',
    },
    {
      variant: 'link',
      action: 'tertiary',
      class:
        'text-tertiary-500 group-hover/button:text-tertiary-300 group-active/button:text-tertiary-300',
    },
    {
      variant: 'link',
      action: 'info',
      class: 'text-info-800 group-hover/button:text-info-500 group-active/button:text-info-500',
    },
    {
      variant: 'link',
      action: 'positive',
      class:
        'text-success-500 group-hover/button:text-success-300 group-active/button:text-success-300',
    },
    {
      variant: 'link',
      action: 'negative',
      class: 'text-error-500 group-hover/button:text-error-300 group-active/button:text-error-300',
    },
    {
      variant: 'link',
      action: 'muted',
      class:
        'text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-700',
    },
  ],
});

const buttonIconStyle = tva({
  base: 'fill-none text-typography-0',
  parentVariants: {
    action: {
      primary:
        'text-primary-500 group-hover/button:text-primary-600 group-active/button:text-primary-700',
      secondary:
        'text-secondary-500 group-hover/button:text-secondary-600 group-active/button:text-secondary-700',
      tertiary:
        'text-tertiary-500 group-hover/button:text-tertiary-600 group-active/button:text-tertiary-700',
      positive:
        'text-success-500 group-hover/button:text-success-600 group-active/button:text-success-700',
      info: 'text-info-500 group-hover/button:text-info-600 group-active/button:text-info-700',
      negative:
        'text-error-500 group-hover/button:text-error-600 group-active/button:text-error-700',
      default:
        'text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-700',
    },
    variant: {
      link: 'text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-700',
      outline:
        'text-typography-800 group-hover/button:text-typography-950 group-active/button:text-typography-950',
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
      class:
        'text-primary-0 group-hover/button:text-primary-0 group-active/button:text-primary-100',
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
    {
      variant: 'outline',
      action: 'primary',
      class:
        'text-primary-500 group-hover/button:text-primary-600 group-active/button:text-primary-600',
    },
    {
      variant: 'outline',
      action: 'secondary',
      class:
        'text-secondary-500 group-hover/button:text-secondary-600 group-active/button:text-secondary-600',
    },
    {
      variant: 'outline',
      action: 'tertiary',
      class:
        'text-tertiary-500 group-hover/button:text-tertiary-600 group-active/button:text-tertiary-600',
    },
    {
      variant: 'outline',
      action: 'info',
      class: 'text-info-500 group-hover/button:text-info-600 group-active/button:text-info-600',
    },
    {
      variant: 'outline',
      action: 'positive',
      class:
        'text-success-500 group-hover/button:text-success-600 group-active/button:text-success-600',
    },
    {
      variant: 'outline',
      action: 'negative',
      class: 'text-error-500 group-hover/button:text-error-600 group-active/button:text-error-600',
    },
    {
      variant: 'outline',
      action: 'muted',
      class:
        'text-typography-900 group-hover/button:text-typography-800 group-active/button:text-typography-700',
    },
    {
      variant: 'link',
      action: 'primary',
      class:
        'text-primary-500 group-hover/button:text-primary-800 group-active/button:text-primary-800',
    },
    {
      variant: 'link',
      action: 'secondary',
      class:
        'text-secondary-500 group-hover/button:text-secondary-800 group-active/button:text-secondary-800',
    },
    {
      variant: 'link',
      action: 'tertiary',
      class:
        'text-tertiary-500 group-hover/button:text-tertiary-800 group-active/button:text-tertiary-800',
    },
    {
      variant: 'link',
      action: 'info',
      class: 'text-info-800 group-hover/button:text-info-500 group-active/button:text-info-500',
    },
    {
      variant: 'link',
      action: 'positive',
      class:
        'text-success-500 group-hover/button:text-success-800 group-active/button:text-success-800',
    },
    {
      variant: 'link',
      action: 'negative',
      class: 'text-error-500 group-hover/button:text-error-800 group-active/button:text-error-800',
    },
    {
      variant: 'link',
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
