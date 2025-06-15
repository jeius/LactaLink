import { PRIORITY_LEVELS } from '@/lib/constants';
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
    options: Object.values(PRIORITY_LEVELS),
  };
};
