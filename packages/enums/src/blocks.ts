export const TEXT_BLOCK_ANSWER_LENGTH = {
  SHORT: { label: 'Short Answer', value: 'SHORT' },
  LONG: { label: 'Long Answer', value: 'LONG' },
} as const;

export const ORIENTATION = {
  VERTICAL: { label: 'Vertical', value: 'vertical' },
  HORIZONTAL: { label: 'Horizontal', value: 'horizontal' },
} as const;

export const CHOICE_TYPE = {
  PREDEFINED: { label: 'Predefined', value: 'PREDEFINED' },
  CUSTOM: { label: 'User Defined', value: 'CUSTOM' },
} as const;

export const WIDTH_OPTIONS = {
  full: { value: 'full', label: '100%' },
  '3/4': { value: '3/4', label: '75%' },
  '2/3': { value: '2/3', label: '66%' },
  '1/2': { value: '1/2', label: '50%' },
  '1/3': { value: '1/3', label: '33%' },
  '1/4': { value: '1/4', label: '25%' },
} as const;
