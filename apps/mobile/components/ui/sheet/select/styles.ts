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
  base: 'flex-row items-center overflow-hidden',
});

const selectIconStyle = tva({
  base: 'text-typography-700',
});

const selectInputFieldStyle = tva({
  base: 'flex-1',
});

export { selectIconStyle, selectInputFieldStyle, selectItemStyle, selectTriggerStyle };
