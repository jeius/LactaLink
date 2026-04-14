import { DonorScreeningFormField } from '@lactalink/types/collections';

/**
 * Builds the initial form state from an array of form fields, applying default values
 * based on field types and their `defaultValue` property.
 *
 * @param fields - An array of form fields, either top-level or within a section.
 * @returns An object mapping field names to their corresponding default values.
 */
export function buildInitialFormState(fields: DonorScreeningFormField[]) {
  return fields.reduce((initialSchema, field) => {
    switch (field.blockType) {
      case 'checkbox':
        return {
          ...initialSchema,
          [field.name.trim()]: field.defaultValue || false,
        };
      case 'email':
        return {
          ...initialSchema,
          [field.name.trim()]: field.defaultValue || '',
        };
      case 'text':
        return {
          ...initialSchema,
          [field.name.trim()]: field.defaultValue || '',
        };
      case 'textarea':
        return {
          ...initialSchema,
          [field.name.trim()]: field.defaultValue || '',
        };
      case 'select':
        return {
          ...initialSchema,
          [field.name.trim()]: field.defaultValue,
        };
      case 'multi-select':
        return {
          ...initialSchema,
          [field.name.trim()]: field.defaultValue || [],
        };
      case 'date':
        return {
          ...initialSchema,
          [field.name.trim()]: field.defaultValue,
        };
      case 'number':
        return {
          ...initialSchema,
          [field.name.trim()]: field.defaultValue,
        };
      case 'radio':
        return {
          ...initialSchema,
          [field.name.trim()]: field.defaultValue,
        };
      default:
        return initialSchema;
    }
  }, {});
}
