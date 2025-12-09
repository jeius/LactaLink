import { tva } from '@gluestack-ui/nativewind-utils/tva';

const buttonStyle = tva({
  base: 'group/button flex-row items-center justify-center gap-2 rounded-xl bg-typography-900 data-[focus-visible=true]:web:outline-none data-[focus-visible=true]:web:ring-2 data-[disabled=true]:opacity-40',
  variants: {
    action: {
      primary:
        'border-primary-400 bg-primary-500 data-[focus-visible=true]:web:ring-indicator-info data-[hover=true]:border-primary-500 data-[hover=true]:bg-primary-400 data-[active=true]:border-primary-600 data-[active=true]:bg-primary-600',
      secondary:
        'border-secondary-500 bg-secondary-500 data-[focus-visible=true]:web:ring-indicator-info data-[hover=true]:border-secondary-400 data-[hover=true]:bg-secondary-400 data-[active=true]:border-secondary-600 data-[active=true]:bg-secondary-600',
      tertiary:
        'border-tertiary-500 bg-tertiary-500 data-[focus-visible=true]:web:ring-indicator-info data-[hover=true]:border-tertiary-400 data-[hover=true]:bg-tertiary-400 data-[active=true]:border-tertiary-600 data-[active=true]:bg-tertiary-600',
      positive:
        'border-success-400 bg-success-400 data-[focus-visible=true]:web:ring-indicator-info data-[hover=true]:border-success-300 data-[hover=true]:bg-success-300 data-[active=true]:border-success-500 data-[active=true]:bg-success-500',
      negative:
        'border-error-500 bg-error-500 data-[focus-visible=true]:web:ring-indicator-info data-[hover=true]:border-error-400 data-[hover=true]:bg-error-400 data-[active=true]:border-error-600 data-[active=true]:bg-error-600',
      info: 'border-info-500 bg-info-500 data-[focus-visible=true]:web:ring-indicator-info data-[hover=true]:border-info-400 data-[hover=true]:bg-info-400 data-[active=true]:border-info-600 data-[active=true]:bg-info-600',
      muted:
        'border-outline-400 bg-background-0 data-[hover=true]:border-outline-300 data-[hover=true]:bg-background-100 data-[active=true]:border-outline-300 data-[active=true]:bg-background-100',
      default:
        'border-typography-900 data-[hover=true]:border-typography-300 data-[hover=true]:bg-typography-300 data-[active=true]:border-typography-600 data-[active=true]:bg-typography-600',
    },
    variant: {
      link: 'bg-transparent px-0 data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
      outline:
        'border bg-transparent data-[hover=true]:bg-background-50 data-[active=true]:bg-background-200',
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
        'bg-transparent px-0 data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    {
      action: 'secondary',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    {
      action: 'tertiary',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    {
      action: 'positive',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    {
      action: 'info',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    {
      action: 'negative',
      variant: 'link',
      class:
        'bg-transparent px-0 data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    {
      action: 'primary',
      variant: 'outline',
      class: 'bg-transparent data-[hover=true]:bg-primary-100 data-[active=true]:bg-primary-200',
    },
    {
      action: 'secondary',
      variant: 'outline',
      class:
        'bg-transparent data-[hover=true]:bg-secondary-100 data-[active=true]:bg-secondary-200',
    },
    {
      action: 'tertiary',
      variant: 'outline',
      class: 'bg-transparent data-[hover=true]:bg-tertiary-100 data-[active=true]:bg-tertiary-200',
    },
    {
      action: 'info',
      variant: 'outline',
      class: 'bg-transparent data-[hover=true]:bg-info-100 data-[active=true]:bg-info-200',
    },
    {
      action: 'positive',
      variant: 'outline',
      class: 'bg-transparent data-[hover=true]:bg-success-100 data-[active=true]:bg-success-200',
    },
    {
      action: 'negative',
      variant: 'outline',
      class: 'bg-transparent data-[hover=true]:bg-error-100 data-[active=true]:bg-error-200',
    },
  ],
});

const buttonTextStyle = tva({
  base: 'font-JakartaSemiBold text-typography-900 web:select-none',
  variants: {
    underlineOnPress: { true: 'data-[active=true]:underline' },
  },
  parentVariants: {
    action: {
      primary:
        'text-primary-500 data-[hover=true]:text-primary-600 data-[active=true]:text-primary-700',
      secondary:
        'text-secondary-500 data-[hover=true]:text-secondary-600 data-[active=true]:text-secondary-700',
      tertiary:
        'text-tertiary-500 data-[hover=true]:text-tertiary-600 data-[active=true]:text-tertiary-700',
      info: 'text-info-500 data-[hover=true]:text-info-600 data-[active=true]:text-info-700',
      positive:
        'text-success-500 data-[hover=true]:text-success-600 data-[active=true]:text-success-700',
      negative: 'text-error-500 data-[hover=true]:text-error-600 data-[active=true]:text-error-700',
      muted:
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
      action: 'tertiary',
      class: 'text-tertiary-0 data-[hover=true]:text-tertiary-0 data-[active=true]:text-tertiary-0',
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
      variant: 'solid',
      action: 'muted',
      class:
        'text-typography-900 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-700',
    },
    {
      variant: 'outline',
      action: 'primary',
      class:
        'text-primary-500 data-[hover=true]:text-primary-600 data-[active=true]:text-primary-600',
    },
    {
      variant: 'outline',
      action: 'secondary',
      class:
        'text-secondary-500 data-[hover=true]:text-secondary-600 data-[active=true]:text-secondary-600',
    },
    {
      variant: 'outline',
      action: 'tertiary',
      class:
        'text-tertiary-500 data-[hover=true]:text-tertiary-600 data-[active=true]:text-tertiary-600',
    },
    {
      variant: 'outline',
      action: 'info',
      class: 'text-info-500 data-[hover=true]:text-info-600 data-[active=true]:text-info-600',
    },
    {
      variant: 'outline',
      action: 'positive',
      class:
        'text-success-500 data-[hover=true]:text-success-600 data-[active=true]:text-success-600',
    },
    {
      variant: 'outline',
      action: 'negative',
      class: 'text-error-500 data-[hover=true]:text-error-600 data-[active=true]:text-error-600',
    },
    {
      variant: 'outline',
      action: 'muted',
      class:
        'text-typography-900 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-700',
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
      action: 'tertiary',
      class:
        'text-tertiary-500 data-[hover=true]:text-tertiary-300 data-[active=true]:text-tertiary-300',
    },
    {
      variant: 'link',
      action: 'info',
      class: 'text-info-800 data-[hover=true]:text-info-500 data-[active=true]:text-info-500',
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
    {
      variant: 'link',
      action: 'muted',
      class:
        'text-typography-900 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-700',
    },
  ],
});

const buttonIconStyle = tva({
  base: 'fill-none text-typography-0 data-[disabled=true]:text-typography-400',
  parentVariants: {
    action: {
      primary:
        'text-primary-500 data-[hover=true]:text-primary-600 data-[active=true]:text-primary-700',
      secondary:
        'text-secondary-500 data-[hover=true]:text-secondary-600 data-[active=true]:text-secondary-700',
      tertiary:
        'text-tertiary-500 data-[hover=true]:text-tertiary-600 data-[active=true]:text-tertiary-700',
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
      action: 'tertiary',
      class: 'text-tertiary-0 data-[hover=true]:text-tertiary-0 data-[active=true]:text-tertiary-0',
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
      variant: 'solid',
      action: 'muted',
      class:
        'text-typography-900 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-700',
    },
    {
      variant: 'outline',
      action: 'primary',
      class:
        'text-primary-500 data-[hover=true]:text-primary-600 data-[active=true]:text-primary-600',
    },
    {
      variant: 'outline',
      action: 'secondary',
      class:
        'text-secondary-500 data-[hover=true]:text-secondary-600 data-[active=true]:text-secondary-600',
    },
    {
      variant: 'outline',
      action: 'tertiary',
      class:
        'text-tertiary-500 data-[hover=true]:text-tertiary-600 data-[active=true]:text-tertiary-600',
    },
    {
      variant: 'outline',
      action: 'info',
      class: 'text-info-500 data-[hover=true]:text-info-600 data-[active=true]:text-info-600',
    },
    {
      variant: 'outline',
      action: 'positive',
      class:
        'text-success-500 data-[hover=true]:text-success-600 data-[active=true]:text-success-600',
    },
    {
      variant: 'outline',
      action: 'negative',
      class: 'text-error-500 data-[hover=true]:text-error-600 data-[active=true]:text-error-600',
    },
    {
      variant: 'outline',
      action: 'muted',
      class:
        'text-typography-900 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-700',
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
      action: 'tertiary',
      class:
        'text-tertiary-500 data-[hover=true]:text-tertiary-800 data-[active=true]:text-tertiary-800',
    },
    {
      variant: 'link',
      action: 'info',
      class: 'text-info-800 data-[hover=true]:text-info-500 data-[active=true]:text-info-500',
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
    {
      variant: 'link',
      action: 'muted',
      class:
        'text-typography-900 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-700',
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
