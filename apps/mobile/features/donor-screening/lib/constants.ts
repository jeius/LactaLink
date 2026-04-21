import {
  checkboxBlockSchema,
  dateBlockSchema,
  emailBlockSchema,
  multiSelectBlockSchema,
  numberBlockSchema,
  radioBlockSchema,
  selectBlockSchema,
  textareaBlockSchema,
  textBlockSchema,
} from '@lactalink/form-schemas/blocks';
import {
  BinaryIcon,
  Calendar1Icon,
  CaseSensitiveIcon,
  CaseUpperIcon,
  CheckSquareIcon,
  CircleDotIcon,
  ListChecksIcon,
  ListIcon,
  MailIcon,
} from 'lucide-react-native';

import { BlockConfig, BlockType, FieldOption } from './types';

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  email: 'Email',
  text: 'Short Answer',
  textarea: 'Long Answer',
  select: 'Dropdown',
  'multi-select': 'Multi-Select',
  checkbox: 'Checkbox',
  radio: 'Single Choice',
  number: 'Number',
  date: 'Date',
};

export const FIELD_OPTIONS: FieldOption[] = [
  {
    label: BLOCK_TYPE_LABELS['text'],
    value: 'text',
    icon: CaseSensitiveIcon,
    description: 'A simple text input field for short answers.',
  },
  {
    label: BLOCK_TYPE_LABELS['textarea'],
    value: 'textarea',
    icon: CaseUpperIcon,
    description: 'A larger text input field for longer answers.',
  },
  {
    label: BLOCK_TYPE_LABELS['select'],
    value: 'select',
    icon: ListIcon,
    description: 'A dropdown field that allows users to select one option from a list.',
  },
  {
    label: BLOCK_TYPE_LABELS['multi-select'],
    value: 'multi-select',
    icon: ListChecksIcon,
    description: 'A dropdown field that allows users to select multiple options from a list.',
  },
  {
    label: BLOCK_TYPE_LABELS['checkbox'],
    value: 'checkbox',
    icon: CheckSquareIcon,
    description: 'A field that allows users to agree/disagree by checking boxes.',
  },
  {
    label: BLOCK_TYPE_LABELS['radio'],
    value: 'radio',
    icon: CircleDotIcon,
    description:
      'A field that allows users to select one option from a list by tapping on a circle.',
  },
  {
    label: BLOCK_TYPE_LABELS['date'],
    value: 'date',
    icon: Calendar1Icon,
    description: 'A field that allows users to select a date from a calendar.',
  },
  {
    label: BLOCK_TYPE_LABELS['email'],
    value: 'email',
    icon: MailIcon,
    description: 'A field that allows users to enter an email address and validates the format.',
  },
  {
    label: BLOCK_TYPE_LABELS['number'],
    value: 'number',
    icon: BinaryIcon,
    description: 'A field that allows users to enter a number and validates the input.',
  },
];

export const BLOCK_CONFIG: Record<BlockType, BlockConfig> = {
  text: {
    schema: textBlockSchema,
    valueType: 'text',
    hasPlaceholder: true,
    hasOptions: false,
    hasDynamicOption: false,
  },
  textarea: {
    schema: textareaBlockSchema,
    valueType: 'text',
    hasPlaceholder: true,
    hasOptions: false,
    hasDynamicOption: false,
  },
  email: {
    schema: emailBlockSchema,
    valueType: 'text',
    hasPlaceholder: true,
    hasOptions: false,
    hasDynamicOption: false,
    defaultLabel: 'Email Address',
  },
  number: {
    schema: numberBlockSchema,
    valueType: 'number',
    hasPlaceholder: true,
    hasOptions: false,
    hasDynamicOption: false,
  },
  checkbox: {
    schema: checkboxBlockSchema,
    valueType: 'boolean',
    hasPlaceholder: false,
    hasOptions: false,
    hasDynamicOption: false,
  },
  date: {
    schema: dateBlockSchema,
    valueType: 'date',
    hasPlaceholder: true,
    hasOptions: false,
    hasDynamicOption: false,
  },
  radio: {
    schema: radioBlockSchema,
    valueType: 'text',
    hasPlaceholder: true,
    hasOptions: true,
    hasDynamicOption: false,
    defaultOptions: [],
  },
  select: {
    schema: selectBlockSchema,
    valueType: 'text',
    hasPlaceholder: true,
    hasOptions: true,
    hasDynamicOption: true,
    defaultOptions: [],
  },
  'multi-select': {
    schema: multiSelectBlockSchema,
    valueType: 'text',
    hasPlaceholder: true,
    hasOptions: true,
    hasDynamicOption: true,
    defaultOptions: [],
  },
};
