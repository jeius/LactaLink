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
