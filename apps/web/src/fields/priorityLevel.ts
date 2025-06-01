import { PRIORITY_LEVEL_OPTIONS } from '@/lib/constants';
import { Field, SelectField } from 'payload';

export const priorityLevel = ({
  required = true,
  defaultValue = 'MEDIUM',
  label,
  admin,
  name = 'priority',
}: Partial<SelectField>): Field => {
  return {
    admin,
    name,
    label,
    type: 'select',
    enumName: 'enum_priority_level',
    required,
    defaultValue,
    options: PRIORITY_LEVEL_OPTIONS,
  };
};
