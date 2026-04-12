import { tva } from '@gluestack-ui/utils/nativewind-utils';

const selectItemStyle = tva({
  base: 'flex-row items-center px-4 py-3',
  variants: {
    isSelected: {
      true: 'border-b border-primary-300 bg-primary-100',
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

const selectIndicatorStyle = tva({
  base: 'mr-2 stroke-primary-600',
  variants: {
    isSelected: {
      true: 'opacity-100',
      false: 'opacity-0',
    },
  },
});

export {
  selectIconStyle,
  selectIndicatorStyle,
  selectInputFieldStyle,
  selectItemStyle,
  selectTriggerStyle,
};
