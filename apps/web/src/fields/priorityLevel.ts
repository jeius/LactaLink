import { PRIORITY_LEVELS } from '@lactalink/enums';
import { Field, SelectField } from 'payload';

export const priorityLevel = ({
  required = true,
  defaultValue = PRIORITY_LEVELS.MEDIUM.value,
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
