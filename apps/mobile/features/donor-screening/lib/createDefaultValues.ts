import { DonorScreeningFormField } from '@lactalink/types/collections';
import { buildInitialFormState } from './buildFormState';

export function createDefaultValues(
  fields: DonorScreeningFormField[],
  values?: Record<string, unknown>
) {
  if (!values) return buildInitialFormState(fields);

  const result = fields.reduce(
    (acc, field) => {
      if (field.blockType === 'message') return acc;

      if (field.name && values[field.name] !== undefined) {
        return { ...acc, [field.name]: values[field.name] };
      }

      return acc;
    },
    {} as typeof values
  );
  return Object.keys(result).length > 0 ? result : undefined;
}
