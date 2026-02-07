import { tva } from '@gluestack-ui/nativewind-utils/tva';

const selectItemStyle = tva({
  base: 'flex-row items-center px-4 py-3',
  variants: {
    isSelected: {
      true: 'bg-primary-100',
    },
  },
});

const selectTriggerStyle = tva({
  base: 'flex-row items-center overflow-hidden rounded-xl border border-outline-500 bg-background-0 px-4 py-2 hover:border-outline-300 focus:border-primary-700 disabled:opacity-40 disabled:hover:border-outline-300',
});

const selectIconStyle = tva({
  base: 'text-typography-700',
});

export { selectIconStyle, selectItemStyle, selectTriggerStyle };
